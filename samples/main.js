//---------------------
// main.ts 8面で大幅に変更。
// 三角形のテスト描画のコードは、紛らわしいのでここで削除してしまいましょう。
// 読み込んだglTFファイルのみを描画するように以下のように書き換えます。
//import { VertexAttributeSet } from '../src/Mesh.js';
import studioxx from '../dist/index.js';
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

void main(void){
    gl_FragColor = v_color;
}
`;
async function main() {
    const canvas = document.getElementById('world');
    const context = new studioxx.Context(canvas);
    const material = new studioxx.Material(context, vertexShaderStr, fragmentShaderStr);
    const glTF2Importer = studioxx.Gltf2Importer.getInstance();
    const meshes = await glTF2Importer.import('../assets/gltf/BoxAnimated/glTF/BoxAnimated.gltf', context, material);
    const gl = context.gl;
    // カラーをクリアする際の色指定します（黒に設定）
    // 深度テストを有効化
    // canvasのカラーと深度をクリアします
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (let mesh of meshes) {
        mesh.draw();
    }
}
main();
/*
//-------------------------------------
//07面よりglTF2Importer追加
const glTF2Importer = studioxx.Gltf2Importer.getInstance();
glTF2Importer.import('../assets/gltf/BoxAnimated/glTF/BoxAnimated.gltf');


//------------------
// フラグメント（ピクセル）シェーダーの内容
const vertexShaderStr = `
precision highp float; // 浮動小数点の精度を「高精度」に指定します

attribute vec3 a_position;
attribute vec4 a_color;
varying vec4 v_color;

void main(void){
    gl_Position = vec4(a_position, 1.0); //
    v_color = a_color; //
}
`;

//------------------
// フラグメント（ピクセル）シェーダーの内容
const fragmentShaderStr = `
precision highp float; // 浮動小数点の精度を～

varying vec4 v_color;

void main(void){
    gl_FragColor = v_color; // Meshから届いた色
}
`;


//三角形描く座標
const vertexData: VertexAttributeSet = {
    position: [
         0.0, -1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0
    ],
    color: [
         1.0,  0.0,  0.0, 1.0,
         0.0,  1.0,  0.0, 1.0,
         0.0,  0.0,  1.0, 1.0
    ],
    indices: [
        0, 1, 2
    ]
}

//--------------------------------------
//ここからがstudio06での変更部分--------
const vertexComponentNumber = 3; // この変数が使われてない？迷子？

const canvas = document.getElementById('world') as HTMLCanvasElement;
const context = new studioxx.Context(canvas);

// Material.tsから
const material = new studioxx.Material(context, vertexShaderStr, fragmentShaderStr);
// Mesh.tsから
const mesh = new studioxx.Mesh(material, context, vertexData);

const gl = context.gl;
// カラーをクリアする際の色を指定します（黒に設定）
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// 深度テストを有効化します
gl.enable(gl.DEPTH_TEST);

// canvasのカラーと深度をクリアします
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


mesh.draw();
*/
