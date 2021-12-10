declare module '*.txt';
declare module '*.json' {
  const data: string;
  export default data;
}