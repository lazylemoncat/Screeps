"use strict";

exports["default"] = {
// ���� rollup ��Ҫ���ʲô
  // Դ�����������ĸ��ļ�
  input: 'src/main.js',
  // ������������
  output: {
      // ������ĸ��ļ�
      file: 'dist/main.js',
      format: 'cjs',
      sourcemap: true
  }
};