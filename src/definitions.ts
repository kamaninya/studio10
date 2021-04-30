// definitions.ts

export enum ShaderType{
    Vertex,
    Fragment
}

export interface WebGLProgram{
    _attributePosition: number;
    _attributeColor: number;
    _uniformBaseColor: WebGLUniformLocation; //ステージ09で追加
}

/*
export interface WebGLBuffer{
    _vertexComponentNumber: number;
    _vertexNumber: number;
}
*/