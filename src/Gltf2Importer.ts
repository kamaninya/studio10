//Gltf2Importer.ts
//import { Gltf2 } from "./glTF2.js"; //7面途中の記述。これも書かないとGltf2が無いと言われる。
import Context from './Context.js';
import { Gltf2Accessor, Gltf2BufferView, Gltf2 } from './glTF2.js'; //アクセサ、バッファビュー、Gltf2読み込み。
//import { Gltf2Accessor, Gltf2BufferView, Gltf2, Gltf2Attribute } from './glTF2.js'; //アクセサ、バッファビュー、Gltf2読み込み。
import Material from './Material.js';
import Mesh, { VertexAttributeSet } from './Mesh.js'; //メッシュも必要。
import Vector4 from './Vector4.js'; //ステージ09で追加

/*
8面での変更。Meshクラスを生成して頂点情報をセットし、呼び出し元にMeshを返すようにしてあげます。
Meshインスタンスの生成にはContextとMaterialのインスタンスが必要です。
これはimportメソッドの引数として呼び出し元から渡してあげることにしましょう。
これで、glTFファイルから読み込んだメッシュに対して、ユーザーが好きな質感（シェーダー）を
適用することができます。
*/
export default class Gltf2Importer {
    private static __instance: Gltf2Importer;

    // ステージ09で追加開始↓↓↓↓↓↓↓↓↓↓↓↓---------------------------------------
    private static readonly vertexShaderStr = `
    precision highp float;

    attribute vec3 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;

    void main (void){
        gl_Position = vec4(a_position, 1.0);
        v_color = a_color;
    }
    `;

    private static readonly fragmentShaderStr = `
    precision highp float;
    
    varying vec4 v_color;
    uniform vec4 u_baseColor;

    void main (void){
        gl_FragColor = v_color * u_baseColor;
    }
    `;
    // ステージ09で追加終了↑↑↑↑↑↑↑↑↑↑↑↑---------------------------------------

    private constructor(){}


    // async import(uri: string, context: Context, material: Material){ //変更。
    async import(uri: string, context: Context){ //変更。
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
        
        // private _loadBinで行われた作業の結果（取り出したbin）を代入
        const arrayBufferBin = await this._loadBin(json, uri);

        // 8面にて変更。メッシュ関数受け取り
        const meshes = this._loadMesh(arrayBufferBin, json, context); 


        // これでbinの中身をコンソールの文字列で出せる…と？
        //console.log(arrayBufferBin);

        return meshes;
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


    // .binを読み込む
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
                console.error('Unsupported ComponentTypedArray.');
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


    // ステージ09で追加開始↓↓↓↓↓↓↓↓↓↓↓↓---------------------------------------
    private _loadMaterial(json: Gltf2, materialIndex: number, context: Context){
        const material = new Material(context, Gltf2Importer.vertexShaderStr, Gltf2Importer.fragmentShaderStr);

        if(materialIndex >= 0){
            const materialJson = json.materials[materialIndex];

            let baseColor = new Vector4(1, 1, 1, 1);
            if(materialJson.pbrMetallicRoughness != null){
                if(materialJson.pbrMetallicRoughness.baseColorFactor != null){

                    const baseColorArray = materialJson.pbrMetallicRoughness.baseColorFactor;
                    baseColor = new Vector4(baseColorArray[0], baseColorArray[1], baseColorArray[2], baseColorArray[3]);
                }
            }

            material.baseColor = baseColor;
        }

        return material;
    }
    // ステージ09で追加終了↑↑↑↑↑↑↑↑↑↑↑↑---------------------------------------


    //8面での変更。
    private _loadMesh(arrayBufferBin: ArrayBuffer, json: Gltf2, context: Context){
        const meshes: Mesh[] = []
        // 全てのメッシュについてループします
        for (let mesh of json.meshes){
            // メッシュの0番目のプリミティブの情報を取得します。
            const primitive = mesh.primitives[0];
            // プリミティブの持つ頂点属性（アトリビュート）の中から位置座標に相当するAccsessor情報を取り出します。
            const attributes = primitive.attributes;

            // ステージ09で追加開始↓↓↓↓↓↓↓↓↓↓↓↓---------------------------------------
            let materialIndex = -1;
            if(primitive.material != null){
                materialIndex = primitive.material;
            }
            const material = this._loadMaterial(json, materialIndex, context);
            // ステージ09で追加終了↑↑↑↑↑↑↑↑↑↑↑↑---------------------------------------


            const positionTypedArray = this.getAttribute(json, attributes.POSITION, arrayBufferBin);
            let colorTypedArray: Float32Array;
            if(attributes.COLOR_0){
                colorTypedArray = this.getAttribute(json, attributes.COLOR_0, arrayBufferBin);
            }

            const vertexData: VertexAttributeSet = {
                position: positionTypedArray,
                color: colorTypedArray!
            }
            const libMesh = new Mesh(material, context, vertexData);
            meshes.push(libMesh);


            /*8面途中の変更前---------------------------------------
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

            // 動的に得た種類のTypedArrayを、頂点データ全体のArrayBufferのうち、
            //指定したオフセットとデータ個数で一部を切り出す形で生成します。
            //ここをFloat32へ変更
            const positionTypedArray = new positionTypedArrayClass(arrayBufferBin, byteOffset, typedArrayComponentCount) as Float32Array;

            //8面での変更、追加。--------
            const vertexData: VertexAttributeSet = {
                position: positionTypedArray
            }

            const libMesh = new Mesh(material, context, vertexData);
            meshes.push(libMesh);
            //------------------------------------------------------
            */


            //console.log(positionTypedArray);
        }

        return meshes; //追加。

    }


    //コメント部分にある定義してたものをここでまとめる
    private getAttribute(json: Gltf2, attributeIndex: number, arrayBufferBin: ArrayBuffer){
        const accessor = json.accessors[attributeIndex] as Gltf2Accessor;
        const bufferView = json.bufferViews[accessor.bufferView!] as Gltf2BufferView;
        const byteOffsetOfBufferView = bufferView.byteOffset!;
        const byteOffsetOfAccessor = accessor.byteOffset!;
        const byteOffset = byteOffsetOfBufferView + byteOffsetOfAccessor;

        const componentBytes = this._componentBytes(accessor.componentType);
        const componentNum = this._componentNum(accessor.type);
        const count = accessor.count;

        const typedArrayComponentCount = componentNum * count;
        const typedArrayClass = this._componentTypedArray(accessor.componentType);
        const typedArray = new typedArrayClass(arrayBufferBin, byteOffset, typedArrayComponentCount) as Float32Array;

        return typedArray
        
    }
    
    

    // このインスタンスの生成・取得方法については「シングルトンパターン」で調べてみてください。
    static getInstance(){
        if(!this.__instance){
            this.__instance = new Gltf2Importer();
        }

        return this.__instance;
    }

}
