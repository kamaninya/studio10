/*
// render.ts
import{ WebGLProgram, WebGLBuffer } from "./definitions.js"; //definition.tsから届いたもの

export function drawScene(gl: WebGLRenderingContext, vertexBuffer: WebGLBuffer, shaderProgram: WebGLProgram){
    // canvasのカラーと深度をクリアします
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // 頂点バッファを有効にします
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    // 現在有効な頂点バッファの指定メモリ位置からのデータを、"a_position"の頂点属性として使用するよう指示します
    gl.vertexAttribPointer(
        shaderProgram._attributePosition,
        vertexBuffer._vertexComponentNumber, gl.FLOAT, false, 0, 0);
    
    // 現在設定している頂点データを使って、WebGLにポリゴンを描画させます（いわゆる「ドローコール」）
    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer._vertexNumber);
}
*/