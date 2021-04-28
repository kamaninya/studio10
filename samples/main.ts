//---------------------
// main.ts
//import main from '../dist/index.js';
import studioxx from '../dist/index.js';
import { VertexAttributeSet } from '../src/Mesh.js';


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



/*
//倉庫--------------------------------------
// vertexShaderStrとfragmentShaderStr。shader.tsから引っ越し
// 頂点シェーダーの内容
const vertexShaderStr = `
precision highp float; // 浮動小数点の精度を「高精度」に指定します

attribute vec3 a_position; // 頂点情報として「位置座標」を入力させます

void main(void){
    gl_Position = vec4(a_position, 1.0); // 位置座標をそのまま出力します
}
`;

//------------------
// フラグメント（ピクセル）シェーダーの内容
const fragmentShaderStr = `
precision highp float; // 浮動小数点の精度を「高精度」に指定します

void main(void){
    gl_FragColor = vec4(0.3, 0.35, 0.95, 1.0); // 色変えできる場所。RGB、そして透過度
}
`;

//三角形描く座標
const vertices = [ //追加。buffer.tsから引っ越し
     0.0, -1.0,  0.0,
     1.0,  1.0,  0.0,
    -1.0,  1.0,  0.0
]



//--------------------------------------
//ここからがstudio06での変更部分--------
const vertexComponentNumber = 3;


const canvas = document.getElementById('world');
const context = new studioxx.Context(canvas);

// Material.tsから
const material = new studioxx.Material(context, vertexShaderStr, fragmentShaderStr);
// Mesh.tsから
const mesh = new studioxx.Mesh(material, context, vertices, vertexComponentNumber);

const gl = context.gl;
// カラーをクリアする際の色を指定します（黒に設定）
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// 深度テストを有効化します
gl.enable(gl.DEPTH_TEST);

// canvasのカラーと深度をクリアします
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

mesh.draw();


//studio06より前の----------------------
//main(); //変更前04
//main(vertices, 3); //変更前05
//main(vertices, 3, vertexShaderStr,fragmentShaderStr); //変更後05

// import hello from '../dist/index.js';
// hello();

*/
