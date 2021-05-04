//---------------------
// main.ts 8面で大幅に変更。
// 三角形のテスト描画のコードは、紛らわしいのでここで削除してしまいましょう。
// 読み込んだglTFファイルのみを描画するように以下のように書き換えます。
//import { VertexAttributeSet } from '../src/Mesh.js';
import studioxx from '../dist/index.js';

//赤に染めるnew Vector4()でインポート求められたましたが…いいのかな？
//import Vector4 from '../dist/Vector4.js';

/*
//------------------
// フラグメント（ピクセル）シェーダーの内容
const vertexShaderStr = `
precision highp float; // 浮動小数点の精度を「高精度」に指定します

attribute vec3 a_position;
attribute vec4 a_color;
varying vec4 v_color;

void main(void){
    gl_Position = vec4(a_position, 1.0);
    v_color = a_color;
}
`;

//------------------
// フラグメント（ピクセル）シェーダーの内容
const fragmentShaderStr = `
precision highp float;

varying vec4 v_color;
uniform vec4 u_baseColor; //ステージ09での追加

void main(void){
    gl_FragColor = v_color * u_baseColor; //ステージ09で変更
}
`;
*/

async function main(){

    const canvas = document.getElementById('world') as HTMLCanvasElement;
    const context = new studioxx.Context(canvas);
    //const material = new studioxx.Material(context, vertexShaderStr, fragmentShaderStr);
    //material.baseColor = new Vector4(1, 0, 0, 1); //ステージ09で追加
    const glTF2Importer = studioxx.Gltf2Importer.getInstance();
    const meshes = await glTF2Importer.import('../assets/gltf/BoxAnimated/glTF/BoxAnimated.gltf', context);

    const gl = context.gl;
    // カラーをクリアする際の色指定します（黒に設定）
    // 深度テストを有効化
    // canvasのカラーと深度をクリアします
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(let mesh of meshes){
        mesh.draw();
    }
    
}

main();

