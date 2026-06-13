<?php

namespace App\Repositories\BaseRepo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Lớp Repository cơ sở trừu tượng (Abstract Base Repository).
 *
 * Triển khai các phương thức CRUD chung dựa trên Eloquent Model.
 * Mọi Repository cụ thể đều kế thừa từ lớp này và chỉ cần khai báo `getModel()`.
 *
 * Pattern: Repository Pattern — tách biệt tầng truy cập dữ liệu khỏi tầng nghiệp vụ (Service).
 */
abstract class BaseRepository implements BaseRepositoryInterface
{
    /** @var Model Instance Eloquent Model được quản lý bởi Repository. */
    protected $model;

    public function __construct()
    {
        $this->makeModel();
    }

    /**
     * Trả về tên class Eloquent Model mà Repository này quản lý.
     * Mỗi Repository con phải triển khai phương thức này.
     *
     * @return string Tên class Model (VD: User::class).
     */
    abstract public function getModel();

    /**
     * Khởi tạo instance Model từ Service Container (IoC).
     * Kiểm tra đảm bảo class trả về là một Eloquent Model hợp lệ.
     *
     * @return Model
     * @throws \Exception Nếu class không phải là Eloquent Model.
     */
    public function makeModel()
    {
        $model = app()->make($this->getModel());

        if (!$model instanceof Model) {
            throw new \Exception("Class {$this->getModel()} must be an instance of Illuminate\\Database\\Eloquent\\Model");
        }

        return $this->model = $model;
    }

    /** {@inheritdoc} */
    public function all(array $columns = ['*']): Collection
    {
        return $this->model->all($columns);
    }

    /** {@inheritdoc} */
    public function find($id, array $columns = ['*']): ?Model
    {
        return $this->model->find($id, $columns);
    }

    /** {@inheritdoc} */
    public function findOrFail($id, array $columns = ['*']): Model
    {
        return $this->model->findOrFail($id, $columns);
    }

    /** {@inheritdoc} */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /** {@inheritdoc} */
    public function update($id, array $data): Model
    {
        $record = $this->findOrFail($id);
        $record->update($data);
        return $record;
    }

    /** {@inheritdoc} */
    public function delete($id): bool
    {
        return (bool) $this->findOrFail($id)->delete();
    }

    /** {@inheritdoc} */
    public function paginate($perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->model->paginate($perPage, $columns);
    }

    /** {@inheritdoc} */
    public function findByField($field, $value, array $columns = ['*']): ?Model
    {
        return $this->model->where($field, $value)->first($columns);
    }

    /** {@inheritdoc} */
    public function where(array $conditions, array $columns = ['*']): Collection
    {
        return $this->model->where($conditions)->get($columns);
    }

    /** {@inheritdoc} */
    public function updateOrCreate(array $attributes, array $values = []): Model
    {
        return $this->model->updateOrCreate($attributes, $values);
    }

    /** {@inheritdoc} */
    public function firstOrCreate(array $attributes, array $values = []): Model
    {
        return $this->model->firstOrCreate($attributes, $values);
    }
}
