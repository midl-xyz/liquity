// A function which return a sum of 2 numbers if first arguments is string otherwise divides by 2

function sumOrDivideByTwo(a: string, b: number): number;
function sumOrDivideByTwo(a: number, b: number): number;
function sumOrDivideByTwo(a: any, b: number): number {
  return typeof a === "string" ? parseFloat(a) + b : a / 2;
}