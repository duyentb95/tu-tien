/**
 * ScreenLoader — fallback hiển thị khi Suspense đang tải lazy chunk.
 * Phong cách cổ phong, nhẹ, không dùng spinner phương Tây.
 */
export const ScreenLoader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {/* 4-corner bracket frame nhỏ */}
        <div className="relative mx-auto h-16 w-16">
          <span
            className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2"
            style={{ borderColor: 'var(--gold-500)' }}
          />
          <span
            className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2"
            style={{ borderColor: 'var(--gold-500)' }}
          />
          <span
            className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2"
            style={{ borderColor: 'var(--gold-500)' }}
          />
          <span
            className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2"
            style={{ borderColor: 'var(--gold-500)' }}
          />

          {/* Ký tự xoay */}
          <div
            className="absolute inset-0 flex items-center justify-center text-2xl"
            style={{
              color: 'var(--gold-300)',
              animation: 'spin 2.5s linear infinite',
            }}
          >
            ✦
          </div>
        </div>

        <p className="mt-4 font-serif text-[13px] italic text-gold-300/80">
          Khai mở thiên cơ...
        </p>
      </div>
    </div>
  );
};
