/**
 * Lottie JSON imports — TS hint cho Vite handle loading.
 * Scoped chỉ trong /lottie/* để không đè type structured-JSON auto của tsc.
 */
declare module '@/lottie/*.json' {
  const value: object;
  export default value;
}
