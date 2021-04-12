// main.js
import main from '../dist/index.js';

const vertices = [ //追加。buffer.tsから引っ越し
     0.0, -1.0,  0.0,
     1.0,  1.0,  0.0,
    -1.0,  1.0,  0.0
];

//main(); //変更前
main(vertices, 3); //変更後

// import hello from '../dist/index.js';
// hello();
