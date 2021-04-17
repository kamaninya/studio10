// Mesh.ts。元buffer.tsがリネームしたもの
import Material from "./Material.js";
import Context from "./Context.js";

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


//import{ WebGLBuffer } from "./definitions.js"; //definition.tsから届いたもの
