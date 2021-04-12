// shader.ts
import{ ShaderType, WebGLProgram } from "./definitions.js"; //definition.tsから届いたもの


const vertexShaderStr = `
precision highp float; // 浮動小数点の精度を「高精度」に指定します

attribute vec3 a_position; // 頂点情報として「位置座標」を入力させます

void main(void){
    gl_Position = vec4(a_position, 1.0); // 位置座標をそのまま出力します
}
`;

// フラグメント（ピクセル）シェーダーの内容
const fragmentShaderStr = `
precision highp float; // 浮動小数点の精度を「高精度」に指定します

void main(void){
    gl_FragColor = vec4(0.3, 0.35, 0.95, 1.0); // 赤い色で表示します
}
`;

//--------------------------------------
function compileShader(gl: WebGLRenderingContext, shaderType: ShaderType, shaderStr: string){

    // シェーダーオブジェクトを作ります
    let shader: WebGLShader | null;
    if(shaderType == ShaderType.Vertex){
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else if(shaderType == ShaderType.Fragment){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    
    if(shader! == null){
        alert('Failed to create WebGL shader.');
        return null;
    }
    
    // シェーダーコードをWebGLに読み込ませます
    gl.shaderSource(shader, shaderStr);

    // 読み込ませたシェーダーコードをコンパイルさせます
    gl.compileShader(shader);
    
    // コンパイルがエラーになった場合は、原因を表示させます
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    
    return shader;
}

//--------------------------------------
export function initProgram(gl: WebGLRenderingContext){
    // シェーダーコードをコンパイルして、頂点シェーダーとフラグメント（ピクセル）シェーダーを作成します。
    var vertexShader = compileShader(gl, ShaderType.Vertex, vertexShaderStr) as WebGLShader;
    var fragmentShader = compileShader(gl, ShaderType.Fragment, fragmentShaderStr) as WebGLShader;
    
    // シェーダープログラム（頂点シェーダーとフラグメントシェーダーをまとめたもの）オブジェクトを作成します。
    const shaderProgram = gl.createProgram() as WebGLProgram;
    
    if(shaderProgram == null){
        alert('Failed to create WebGL program.');
        return null;
    }
    
    // シェーダープログラムに頂点シェーダーとフラグメントシェーダーを設定します
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    
    // シェーダープログラムを「リンク」させて、シェーダープログラムを使用できるよう準備します
    gl.linkProgram(shaderProgram);
    
    // リンク処理でエラーが起きた場合は、その旨を表示してプログラム中断します
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
        alert("Could not initialize shaders");
        return null
    }
    
    // シェーダープログラムの使用開始を指示します
    gl.useProgram(shaderProgram);
    
    // 現在のシェーダープログラムから、アトリビュート変数"a_position"のロケーション（参照のようなもの）を
    //取得します。
    // attributePosition = gl.getAttribLocation(shaderProgram, "a_position");
    shaderProgram._attributePosition = gl.getAttribLocation(shaderProgram, "a_position");
    
    // "a_position"の頂点属性を使えるようにするために、GPUにこの頂点属性入力を有効化させます
    gl.enableVertexAttribArray(shaderProgram._attributePosition);
    
    return shaderProgram;
}
