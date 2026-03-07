import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { vnpayAPI } from "../../src/services/api";
import { useCart } from "../../src/context/CartContext";
import { useAuth } from "../../src/context/AuthContext";

const buildParams = (paramString) => {
  const params = {};
  const search = new URLSearchParams(paramString);
  search.forEach((value, key) => {
    params[key] = value;
  });
  return params;
};

const VnpayReturn = () => {
  const [searchParams] = useSearchParams();
  const paramString = searchParams.toString();
  const params = useMemo(() => buildParams(paramString), [paramString]);
  const hasParams = paramString.length > 0;
  const { clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const successHandledRef = useRef(false);
  const [state, setState] = useState(() => {
    const hasParamsInitial = paramString.length > 0;
    if (!hasParamsInitial) {
      return {
        loading: false,
        error: "Thiếu tham số trả về từ VNPay.",
        data: null,
      };
    }
    return { loading: true, error: null, data: null };
  });

  useEffect(() => {
    if (!hasParams) return;

    let isActive = true;
    vnpayAPI
      .verifyReturn(params)
      .then((data) => {
        if (!isActive) return;
        setState({ loading: false, error: null, data });

        if (data?.isVerified && data?.isSuccess && !successHandledRef.current) {
          successHandledRef.current = true;
          if (isAuthenticated && user) {
            const cartKey = `cart_${user._id || user.id}`;
            localStorage.setItem(cartKey, JSON.stringify([]));
          } else {
            localStorage.setItem('cart_guest', JSON.stringify([]));
          }

          clearCart();

        }
      })
      .catch((error) => {
        if (!isActive) return;
        const message =
          error.response?.data?.message || "Không thể xác minh giao dịch.";
        setState({ loading: false, error: message, data: null });
      });

    return () => {
      isActive = false;
    };
  }, [hasParams, params]);

  const isSuccess = state.data?.isVerified && state.data?.isSuccess;
  const title = state.loading
    ? "Đang xác minh giao dịch..."
    : state.error
      ? "Xác minh giao dịch thất bại"
      : isSuccess
        ? "Thanh toán thành công"
        : "Thanh toán chưa thành công";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden border-2 border-gray-300 bg-white shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-200 bg-black px-6 py-8 sm:px-10">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                {state.loading ? (
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : state.error ? (
                  <div className="flex h-12 w-12 items-center justify-center">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                ) : isSuccess ? (
                  <div className="flex h-12 w-12 items-center justify-center">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 sm:px-10">
            {state.loading && (
              <div className="space-y-4">
                <p className="text-base text-gray-700">
                  Vui lòng chờ trong giây lát để hệ thống xác minh giao dịch.
                </p>
                <div className="flex gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-black [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-black [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-black"></div>
                </div>
              </div>
            )}

            {state.error && (
              <div className="border-l-4 border-black bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">{state.error}</p>
              </div>
            )}

            {!state.loading && !state.error && (
              <div className="space-y-4">
                <div className="border-l-4 border-black bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">
                    {state.data?.message || "Giao dịch đã được xử lý."}
                  </p>
                </div>

                {state.data?.orderId && (
                  <div className="border border-gray-200 bg-white p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium text-gray-600">Mã đơn hàng</span>
                      <code className="border border-gray-300 bg-gray-50 px-3 py-1.5 font-mono text-sm font-medium text-gray-900">
                        {state.data.orderId}
                      </code>
                    </div>
                  </div>
                )}

                <div className="border border-gray-200 bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium text-gray-600">Trạng thái xác minh</span>
                    <span className={`inline-flex w-fit items-center gap-2 border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${state.data?.isVerified
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-900"
                      }`}>
                      {state.data?.isVerified ? "Hợp lệ" : "Không hợp lệ"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-6 sm:px-10">
            <div className="flex flex-col gap-3 sm:flex-row">
              {isSuccess ? (
                <Link
                  to="/order"
                  className="inline-flex items-center justify-center gap-2 border-2 border-black bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Xem đơn hàng
                </Link>
              ) : (
                <Link
                  to="/cart"
                  className="inline-flex items-center justify-center gap-2 border-2 border-black bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Quay lại giỏ hàng
                </Link>
              )}
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-gray-900 transition-all hover:border-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>

        {/* Info note */}
        {!state.loading && (
          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Nếu có thắc mắc, vui lòng liên hệ{" "}
              <a href="/contact" className="font-medium text-black underline hover:no-underline">
                hỗ trợ khách hàng
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VnpayReturn;