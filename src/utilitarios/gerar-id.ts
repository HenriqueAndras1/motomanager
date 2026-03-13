export function gerarId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}