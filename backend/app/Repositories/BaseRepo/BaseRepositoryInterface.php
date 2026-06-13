<?php

namespace App\Repositories\BaseRepo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface Repository cơ sở (Base Repository Interface).
 *
 * Định nghĩa các phương thức CRUD chung cho tất cả các Repository trong hệ thống.
 * Mọi Repository Interface cụ thể đều kế thừa từ interface này.
 */
interface BaseRepositoryInterface
{
    /**
     * Lấy tất cả bản ghi.
     *
     * @param array $columns Các cột cần lấy.
     * @return Collection
     */
    public function all(array $columns = ['*']): Collection;

    /**
     * Tìm bản ghi theo ID (trả về null nếu không tìm thấy).
     *
     * @param mixed $id ID bản ghi.
     * @param array $columns Các cột cần lấy.
     * @return Model|null
     */
    public function find($id, array $columns = ['*']): ?Model;

    /**
     * Tìm bản ghi theo ID (ném Exception nếu không tìm thấy).
     *
     * @param mixed $id ID bản ghi.
     * @param array $columns Các cột cần lấy.
     * @return Model
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findOrFail($id, array $columns = ['*']): Model;

    /**
     * Tạo bản ghi mới.
     *
     * @param array $data Dữ liệu tạo bản ghi.
     * @return Model
     */
    public function create(array $data): Model;

    /**
     * Cập nhật bản ghi theo ID.
     *
     * @param mixed $id ID bản ghi cần cập nhật.
     * @param array $data Dữ liệu cập nhật.
     * @return Model
     */
    public function update($id, array $data): Model;

    /**
     * Xóa bản ghi theo ID.
     *
     * @param mixed $id ID bản ghi cần xóa.
     * @return bool
     */
    public function delete($id): bool;

    /**
     * Phân trang danh sách bản ghi.
     *
     * @param int   $perPage Số bản ghi mỗi trang.
     * @param array $columns Các cột cần lấy.
     * @return LengthAwarePaginator
     */
    public function paginate($perPage = 15, array $columns = ['*']): LengthAwarePaginator;

    /**
     * Tìm bản ghi đầu tiên theo giá trị của một trường cụ thể.
     *
     * @param string $field Tên trường.
     * @param mixed  $value Giá trị cần tìm.
     * @param array  $columns Các cột cần lấy.
     * @return Model|null
     */
    public function findByField($field, $value, array $columns = ['*']): ?Model;

    /**
     * Tìm danh sách bản ghi theo điều kiện.
     *
     * @param array $conditions Mảng điều kiện WHERE.
     * @param array $columns Các cột cần lấy.
     * @return Collection
     */
    public function where(array $conditions, array $columns = ['*']): Collection;

    /**
     * Tạo mới hoặc cập nhật bản ghi dựa trên các thuộc tính duy nhất.
     *
     * @param array $attributes Các thuộc tính dùng để tìm bản ghi.
     * @param array $values     Giá trị cần cập nhật hoặc tạo mới.
     * @return Model
     */
    public function updateOrCreate(array $attributes, array $values = []): Model;

    /**
     * Lấy bản ghi đầu tiên thỏa mãn điều kiện hoặc tạo mới nếu không tìm thấy.
     *
     * @param array $attributes Các thuộc tính dùng để tìm bản ghi.
     * @param array $values     Giá trị dùng để tạo mới nếu không tìm thấy.
     * @return Model
     */
    public function firstOrCreate(array $attributes, array $values = []): Model;
}
