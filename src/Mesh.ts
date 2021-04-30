//--------------------------------------
// Mesh.ts。元buffer.tsがリネームしたもの
import Material from "./Material.js";
import Context from "./Context.js";

//--------------------------------------
// R＆Dステージ08での変更。
export type VertexAttributeSet = {
    position: number[] | Float32Array, // 通常配列なのでFloat32に変更。
    color?: number[] | Float32Array, // 残り3つも同様
    normal?: number[] | Float32Array,
    texcoord?: number[] | Float32Array,
    indices?: number[] | Uint16Array //これはUint16
}


export default class Mesh{
    private _positionBuffer: WebGLBuffer;
    private _colorBuffer: WebGLBuffer;
    private _indexBuffer?: WebGLBuffer;

    private _vertexNumber = 0;
    private _indexNumber = 0;
    private _material: Material;
    private _context: Context;
    private static readonly _positionComponentNumber = 3;
    private static readonly _colorComponentNumber = 4;

    constructor(material: Material, context: Context, vertexData: VertexAttributeSet){
        this._material = material;
        this._context = context;
        this._vertexNumber = vertexData.position.length / Mesh._positionComponentNumber;
        
        this._positionBuffer = this._setupVertexBuffer(vertexData.position, [0, 0, 0]);
        this._colorBuffer = this._setupVertexBuffer(vertexData.color!, [1, 1, 1, 1]);
        
        if(vertexData.indices != null){
            this._indexBuffer = this._setupIndexBuffer(vertexData.indices);
            this._indexNumber = vertexData.indices.length;
        }
    }
    
    //--------------------
    // WebGLのVertexBufferやIndexBufferを作成する関数は、配列が渡されることを想定していましたから、
    // TypedArrayが渡されても対応できるように少し書き換えます。
    private _setupVertexBuffer(_array: number[] | Float32Array, defaultArray: number[]){ //変更
        let array = _array;
        
        if(array == null){
            array = [];
            for(let i=0; i<this.vertexNumber; i++){
                array = array.concat(defaultArray);
            }
        }

        const gl = this._context.gl;

        // ↓頂点属性用のバッファを作成します
        const buffer = gl.createBuffer() as WebGLBuffer;
        // ↓バッファを有効化します
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        // Float32追加
        const typedArray = (array.constructor === Float32Array) ? array as Float32Array : new Float32Array(array);

        // ↓位置座標データをバッファに登録します。ここも変更。すぐ上のtypedArrayでFloat32になっているのでこれに変える。
        gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
        
        return buffer;        
    }
    
    
    private _setupIndexBuffer(indicesArray: number[] | Uint16Array){ //変更
        const gl = this._context.gl;
        // ↓頂点属性用のバッファを作成します
        const buffer = gl.createBuffer() as WebGLBuffer;
        // ↓バッファを有効化します
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        // こっちはUint16追加
        const typedArray = (indicesArray.constructor === Uint16Array) ? indicesArray as Uint16Array : new Uint16Array(indicesArray);
        // ↓位置座標データをバッファに登録します。bufferData内の2つ目をtypedArrayへ…
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
        return buffer;
    }
    
    
    private _setVertexAttribPointer(vertexBuffer: WebGLBuffer, attributeSlot: number, componentNumber: number){
        if(vertexBuffer != null){
            const gl = this._context.gl;

            // ↓頂点属性用のバッファを作成します
            // const buffer = gl.createBuffer() as WebGLBuffer;
            // ↓バッファを有効化します
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            // ↓位置座標データをバッファに登録します
            gl.vertexAttribPointer(
                attributeSlot,
                componentNumber, gl.FLOAT, false, 0, 0);       
        }
    }

    draw(){
        const gl = this._context.gl;
        
        this._setVertexAttribPointer(this._positionBuffer, this.material.program!._attributePosition, Mesh._positionComponentNumber);
        this._setVertexAttribPointer(this._colorBuffer!, this.material.program!._attributeColor, Mesh._colorComponentNumber);
        
        if(this._indexBuffer != null){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
            gl.drawElements(gl.TRIANGLES, this._indexNumber, gl.UNSIGNED_SHORT, 0);
        }else{
            gl.drawArrays(gl.TRIANGLES, 0, this.vertexNumber);
        }
    }


    get vertexNumber() {
        return this._vertexNumber;
    }
    
    get material() {
        return this._material;
    }
    
}


//倉庫-----------------------------------------------
/*

export default class Mesh{
    private _vertexBuffer: WebGLBuffer;
    private _vertexComponentNumber = 0;
    private _vertexNumber = 0;
    private _material: Material;
    private _context: Context;
    
    constructor(material: Material, context: Context, vertices:number[], vertexComponentNumber: number){
        this._material = material;
        this._context = context;
        const gl = context.gl
        
        // ↓頂点属性用のバッファを作成します
        const vertexBuffer = gl.createBuffer() as WebGLBuffer;
        // ↓バッファを有効化します
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // ↓位置座標データをバッファに登録します
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // studio03のindex.tsの最初の方で書かれていたものがここに入る
        this._vertexComponentNumber = vertexComponentNumber; //変更後
        this._vertexNumber = vertices.length / vertexComponentNumber; //変更後
        
        this._vertexBuffer = vertexBuffer;
        
    }

    
    // ちなみに、それまでrender.tsにあったdrawSceneメソッドの中身もほぼdrawメソッドとしてMeshクラスに
    // 移しています。描画処理は、それ自体をRenderクラスなどのクラスとして独立させ、それに対して
    // Meshインスタンスを都度与えて描画してもらう設計にすることもできますし、今回のように
    // Meshクラス自体に描画機能をもたせてしまう方法もあります。
    draw(){
        const gl = this._context.gl;

        // 頂点バッファを有効にします
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer!);
        // 現在有効な頂点バッファの指定メモリ位置からのデータを、"a_position"の頂点属性として使用するよう指示します
        gl.vertexAttribPointer(
            this.material.program!._attributePosition,
            this.vertexComponentNumber, gl.FLOAT, false, 0, 0);
        
        // 現在設定している頂点データを使って、WebGLにポリゴンを描画させます（いわゆる「ドローコール」）
        gl.drawArrays(gl.TRIANGLES, 0, this._vertexNumber);
    }
    
    
    //リターンする
    get vertexBuffer() {
        return this._vertexBuffer;
    }
    
    get vertexComponentNumber() {
        return this._vertexComponentNumber;
    }
    
    get vertexNumber() {
    return this._vertexNumber;
    }
    
    get material() {
        return this._material;
    }
}

*/
//--------------------------------------

//import{ WebGLBuffer } from "./definitions.js"; //definition.tsから届いたもの
