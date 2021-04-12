// buffer.ts
import{ WebGLBuffer } from "./definitions.js"; //definition.tsから届いたもの

// export function initBuffers(gl: WebGLRenderingContext){ //変更前 verticesとComponentNumberが追加
export function initBuffers(gl: WebGLRenderingContext, vertices: number[], vertexComponentNumber: number){
    // 頂点属性用のバッファを作成します
    const vertexBuffer = gl.createBuffer() as WebGLBuffer;
    // バッファを有効化します
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    // 頂点情報（位置座標）の実際のデータ。三角形です。
    //verticesはmain.tsに引っ越し


    // 位置座標データをバッファに登録します
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    // studio03のindex.tsの最初の方で書かれていたものがここに入る
    // vertexBuffer._vertexComponentNumber = 3; //変更前
    // vertexBuffer._vertexNumber = 3; //変更前
    vertexBuffer._vertexComponentNumber = vertexComponentNumber; //変更後
    vertexBuffer._vertexNumber = vertices.length / vertexComponentNumber; //変更後

    return vertexBuffer;
}
