// シェーダー？
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

let attributePosition: number = -1;
const vertexComponentNumber = 3;
const vertexNumber = 3;

// TypeScriptにはC言語やjava、C#に似たenum構文があります。
// JavaScriptしか触ったことのない人には馴染みがないかもしれませんが、
// 文字列やnumberで識別するより視認性や保守性が向上します。
enum ShaderType{
    Vertex,
    Fragment
}

function initWebGL(canvas: HTMLCanvasElement){
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    
    if(gl == null){
        alert('Failed to initialize WebGL.');
    }
    
    return gl;
}

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


function initProgram(gl: WebGLRenderingContext){
    // シェーダーコードをコンパイルして、頂点シェーダーとフラグメント（ピクセル）シェーダーを作成します。
    var vertexShader = compileShader(gl, ShaderType.Vertex, vertexShaderStr) as WebGLShader;
    var fragmentShader = compileShader(gl, ShaderType.Fragment, fragmentShaderStr) as WebGLShader;
    
    // シェーダープログラム（頂点シェーダーとフラグメントシェーダーをまとめたもの）オブジェクトを作成します。
    const shaderProgram = gl.createProgram();
    
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
    attributePosition = gl.getAttribLocation(shaderProgram, "a_position");
    
    // "a_position"の頂点属性を使えるようにするために、GPUにこの頂点属性入力を有効化させます
    gl.enableVertexAttribArray(attributePosition);
    
    return shaderProgram;
}


function initBuffers(gl: WebGLRenderingContext){
    // 頂点属性用のバッファを作成します
    const vertexBuffer = gl.createBuffer() as WebGLBuffer;
    // バッファを有効化します
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    // 頂点情報（位置座標）の実際のデータ。三角形です。
    var vertices = [
         0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
    // 位置座標データをバッファに登録します
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    return vertexBuffer;
}


function drawScene(gl: WebGLRenderingContext, vertexBuffer: WebGLBuffer){
    // canvasのカラーと深度をクリアします
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // 頂点バッファを有効にします
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    // 現在有効な頂点バッファの指定メモリ位置からのデータを、"a_position"の頂点属性として使用するよう指示します
    gl.vertexAttribPointer(
        attributePosition,
        vertexComponentNumber, gl.FLOAT, false, 0, 0);
    
    // 現在設定している頂点データを使って、WebGLにポリゴンを描画させます（いわゆる「ドローコール」）
    gl.drawArrays(gl.TRIANGLES, 0, vertexNumber);
}


export default function main(){
    const canvas = document.getElementById('world') as HTMLCanvasElement;
    const gl = initWebGL(canvas);
    
    if(gl == null){
        return false;
    }
    initProgram(gl);
    
    const vertexBuffer = initBuffers(gl);
    
    // カラーをクリアする際の色を指定します（黒に設定）
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 深度テストを有効化します
    gl.enable(gl.DEPTH_TEST);
    
    drawScene(gl, vertexBuffer);
    
    return true;
}


//------------------------------------------------------------------------------
//export default function hello() {
//  console.log("Hello from WebGL Library");
//}
