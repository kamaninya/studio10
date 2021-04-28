// definitions.ts

export enum ShaderType{
    Vertex,
    Fragment
}

export interface WebGLProgram{
    _attributePosition: number;
    _attributeColor: number;
}

/*
export interface WebGLBuffer{
    _vertexComponentNumber: number;
    _vertexNumber: number;
}
*/