<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

/**
 * Trait chuẩn hóa phản hồi API.
 *
 * Cung cấp 2 phương thức chung cho tất cả Controller:
 * - success(): Trả về phản hồi thành công (status = 'success').
 * - error(): Trả về phản hồi lỗi (status = 'error').
 *
 * Cấu trúc JSON thống nhất: { status, message, data/errors }
 */
trait ApiResponses
{
    /**
     * Trả về phản hồi JSON thành công.
     *
     * @param mixed       $data    Dữ liệu trả về.
     * @param string|null $message Thông báo thành công.
     * @param int         $code    HTTP status code (mặc định 200).
     */
    protected function success(mixed $data, ?string $message = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Trả về phản hồi JSON lỗi.
     *
     * @param string     $message Thông báo lỗi.
     * @param int        $code    HTTP status code (mặc định 400).
     * @param mixed|null $errors  Chi tiết lỗi (validation errors...).
     */
    protected function error(string $message, int $code = 400, mixed $errors = null): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}
