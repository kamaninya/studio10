//Gltf2Importer.ts
//import { Gltf2 } from "./glTF2.js"; //7面途中の記述。これも書かないとGltf2が無いと言われる。
import { Gltf2Accessor, Gltf2BufferView, Gltf2 } from './glTF2.js'; //アクセサ、バッファビュー、Gltf2読み込み。
import Mesh from "./Mesh.js"; //メッシュも必要。


export default class Gltf2Importer {
    private static __instance: Gltf2Importer;

    private constructor(){}

    async import(uri: string){
        let response: Response;
        try{
            response = await fetch(uri);
        } catch (err){
            console.log('glTF2 load error.', err);
        }

        // fetch関数のレスポンスのデータをArrayBufferに変換します。
        const arrayBuffer = await response!.arrayBuffer();

        /*
        【記録】07-gltf-meshのJSONデータ取得をコンソールで見届けた所からの変更。
        private _loadFromArrayBufferでやっていた事をここで行うらしい。
        JSONを強引にas Gltf2に変えて、Gltf2をパースしているのだろうか？
        _loadFromz～は片付けずにとりあえずコメントアウト。
        */
        const gotText = this._arrayBufferToString(arrayBuffer);
        const json = JSON.parse(gotText) as Gltf2;
        
        // this._loadFromArrayBuffer(arrayBuffer); //ここはまだ待機中
        
        // private _loadBinで行われた作業の結果（取り出したbin）を受け取るの？
        const arrayBufferBin = await this._loadBin(json, uri);

        // arrayBufferBinが宣言された後に入れないとエラーになる
        this._loadMesh(arrayBufferBin, json);


        // これでbinの中身をコンソールの文字列で出せる…と？
        console.log(arrayBufferBin);

    }
    

    // ArrayBufferから文字列に変換する関数です。
    // こういう処理はいろいろネットを調べて少しずつ作っていったり、発見するものですので、
    // 「こんなコード思いつかないよ！」なんて落ち込まないでくださいね。
    // 地道に続ければどうにかなるものです。
    private _arrayBufferToString(arrayBuffer: ArrayBuffer){
        if(typeof TextDecoder !== 'undefined'){
            let textDecoder = new TextDecoder();
            return textDecoder.decode(arrayBuffer);
        }else{
            let bytes = new Uint8Array(arrayBuffer);
            let result = "";
            let length = bytes.length;
            for(let i = 0; i < length; i++){
                result += String.fromCharCode(bytes[i]);
            }

            return result;
        }
    }


    /*
    //JSONデータを取り出す所までの。
    private _loadFromArrayBuffer(arrayBuffer: ArrayBuffer){
        const gotText = this._arrayBufferToString(arrayBuffer);

        // 文字列をJSONとしてパースします。
        const json = JSON.parse(gotText);

        console.log(json);
        }

    */


    // .binを読み込むらしい
    private async _loadBin(json: Gltf2, uri: string){

        // Gltf2Impoert.import()メソッドに渡されたgltfファイルのURIから、
        // ベースパス（.gltfや.binファイルがあるフォルダパス）を取得します。
        const basePath = uri.substring(0, uri.lastIndexOf('/')) + '/';

        // json.buffers配列から0番目のbufferオブジェクトを取り出す
        //（大抵は配列の中に１つしかありません）
        const bufferInfo = json.buffers[0];
        // bufferオブジェクトのuriプロパティに.binファイルへの相対パスが入っているので、
        const splitted = bufferInfo.uri!.split('/');
        // ファイル名部分を取り出します。
        const filename = splitted[splitted.length - 1];

        // ベースパスに.binファイル名を加えることで、.binファイルのURIになります。
        // そのURLをfetchすることで、.binファイルを読み込みます。
        const response = await fetch(basePath + filename);
        // 読み込んだバイト列をArrayBufferとして取り出します。
        const arrayBufferBin = await response.arrayBuffer();

        //console.log(arrayBufferBin);

        // 戻り値があるからconsole無しでも警告が出ない！
        return arrayBufferBin;
    }


    //------------------------------------
    // Binファイルを取得して中身を見た後からスタート
    private _componentBytes(componentType: number){
        switch (componentType){
            // 以下の数値は、実はWebGL/OpenGLにおけるenum定数です
            case 5123: // UNSIGNED_SHORT
                return 2;
            case 5125: // UNSIGNED_INT
                return 4;
            case 5126: // FLOAT
                return 4;
            default:
                console.error('Unsupported ComponentType.');
                return 0;
        }
    }

    private _componentTypedArray(componentType: number){
        switch (componentType){
            case 5123: // UNSIGNED_SHORT
                return Uint16Array;
            case 5125: // UNSIGNED_INT
                return Uint32Array;
            case 5126: //FLOAT
                return Float32Array;
            default:
                console.error('Unsupported ComponentTypedArray.')
                return Uint8Array;
        }
    }

    private _componentNum(type: string){
        switch (type){
            case 'SCALAR':
                return 1;
            case 'VEC2':
                return 2;
            case 'VEC3':
                return 3;
            case 'VEC4':
                return 4;
            case 'MAT3':
                return 9;
            case 'MAT4':
                return 16;
            default:
                console.error('Unsupported Type.');
                return 0;
        }
    }

    private _loadMesh(arrayBufferBin: ArrayBuffer, json: Gltf2){
        const meshes: Mesh[] = []
        // 全てのメッシュについてループします
        for (let mesh of json.meshes){
            // メッシュの0番目のプリミティブの情報を取得します。
            const primitive = mesh.primitives[0];

            // プリミティブの持つ頂点属性（アトリビュート）の中から位置座標に相当するAccsessor情報を取り出します。
            const attributes = primitive.attributes;
            const positionAccessor = json.accessors[attributes.POSITION] as Gltf2Accessor;

            // 頂点座標のAccsessorが属しているBufferViewの情報を取り出します。
            const positionBufferView = json.bufferViews[positionAccessor.bufferView!] as Gltf2BufferView;


            // BufferViewの、自身が属するBufferの先頭からのメモリ位置（オフセット）を取得します
            const byteOffsetOfBufferView = positionBufferView.byteOffset!;

            // Accsessorの、自身が属するBufferViewの先頭からのメモリ位置（オフセット）を取得します
            const byteOffsetOfAccessor = positionAccessor.byteOffset!;

            // 両方を足すことで、Buffer(ArrayBuffer)先頭からのオフセットが求まります。
            const byteOffset = byteOffsetOfBufferView + byteOffsetOfAccessor;


            // 頂点属性のコンポーネントの型を取得します（16ビットの正整数か、32ビット正整数か、32ビット浮動小数点か）
            const positionComponentBytes = this._componentBytes(positionAccessor.componentType);

            // 頂点座標のコンポーネントの数を取得します（x,y,zなら３つ、x,y,z,wなら４つです）
            const positionComponentNum = this._componentNum(positionAccessor.type);

            // 頂点の数を取得します。↑のプリミティブ云々を参照。あそこから取る。
            const count = positionAccessor.count;


            // TypedArray(今回の場合はFloat32Array)の第３引数に与える、Float型数値の個数を求めます。
            const typedArrayComponentCount = positionComponentNum * count;

            // コンポーネントの型に合わせたTypedArray（Uint16Array/Uint32Array/Float32Array)のクラスオブジェクトを取得します
            const positionTypedArrayClass = this._componentTypedArray(positionAccessor.componentType);

            // 動的に得た種類のTypedArrayを、頂点データ全体のArrayBufferのうち、指定したオフセットとデータ個数で一部を切り出す形で生成します。
            const positionTypedArray = new positionTypedArrayClass(arrayBufferBin, byteOffset, typedArrayComponentCount);


            console.log(positionTypedArray);
        }

    }
    

    // このインスタンスの生成・取得方法については「シングルトンパターン」で調べてみてください。
    static getInstance(){
        if(!this.__instance){
            this.__instance = new Gltf2Importer();
        }

        return this.__instance;
    }



}
