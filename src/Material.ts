// Material.ts。元shader.tsがリネームしたもの
import{ ShaderType, WebGLProgram } from "./definitions.js"; //definition.tsから届いたもの
import Context from "./Context.js";
import Vector4 from "./Vector4.js"; //ステージ09での追加

// const vertexShaderStr　～はmain.jsに引っ越し

export default class Material{
    private _program: WebGLProgram;
    private _baseColor = new Vector4(1,1,1,1); //ステージ09での追加

    
    constructor(context: Context, vertexShaderStr: string, fragmentShaderStr: string){
        const gl= context.gl;

        // シェーダーコードをコンパイルして、頂点シェーダーとフラグメント（ピクセル）シェーダーを作成します。
        var vertexShader = this.compileShader(gl, ShaderType.Vertex, vertexShaderStr) as WebGLShader;
        var fragmentShader = this.compileShader(gl, ShaderType.Fragment, fragmentShaderStr) as WebGLShader;

        // シェーダープログラム（頂点シェーダーとフラグメントシェーダーをまとめたもの）オブジェクトを作成します。
        const shaderProgram = gl.createProgram() as WebGLProgram;

        if(shaderProgram == null){
            alert('Failed to create WebGL program.');
        }

        // シェーダープログラムに頂点シェーダーとフラグメントシェーダーを設定します
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        
        // シェーダープログラムを「リンク」させて、シェーダープログラムを使用できるよう準備します
        gl.linkProgram(shaderProgram);
        
        // リンク処理でエラーが起きた場合は、その旨を表示してプログラム中断します
        if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
            alert("Could not initialize shaders");
            // return null
        }


        // シェーダープログラムの使用開始を指示します
        gl.useProgram(shaderProgram);
        
        // 現在のシェーダープログラムから、アトリビュート変数"a_position"の
        // ロケーション（参照のようなもの）を取得します。
        // attributePosition = gl.getAttribLocation(shaderProgram, "a_position");の変更
        shaderProgram._attributePosition = gl.getAttribLocation(shaderProgram, "a_position");
        
        // "a_position"の頂点属性を使えるようにするために、GPUにこの頂点属性入力を有効化させます
        gl.enableVertexAttribArray(shaderProgram._attributePosition);

        // attributeColorが入ってないので、attributePositionと同様に処理しよう
        shaderProgram._attributeColor = gl.getAttribLocation(shaderProgram, "a_color");
        gl.enableVertexAttribArray(shaderProgram._attributeColor);

        //ステージ09での追加
        shaderProgram._uniformBaseColor = gl.getUniformLocation(shaderProgram, 'u_baseColor')!;

        this._program = shaderProgram;

    }

    //--------------------------------------
    compileShader(gl: WebGLRenderingContext, shaderType: ShaderType, shaderStr: string){

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
    
    get program(){
        return this._program
    }


    //ステージ09での追加始まり-----------------------------------------------
    setUniformValues(gl: WebGLRenderingContext){
        gl.uniform4fv(this._program._uniformBaseColor, this._baseColor.raw);
    }

    set baseColor(color: Vector4){
        this._baseColor = color;
    }
    get baseColor(): Vector4{
        return this._baseColor;
    }

    useProgram(gl: WebGLRenderingContext){
        gl.useProgram(this._program);
    }

    //ステージ09での追加ここまで-----------------------------------------------
    
}
