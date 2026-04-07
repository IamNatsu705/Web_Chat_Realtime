<?php

namespace App\Repositories\BaseRepo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

abstract class BaseRepository implements BaseRepositoryInterface
{
    /** @var Model */
    protected $model;

    public function __construct()
    {
        $this->makeModel();
    }

    abstract public function getModel();

    public function makeModel()
    {
        $model = app()->make($this->getModel());

        if (!$model instanceof Model) {
            throw new \Exception("Class {$this->getModel()} must be an instance of Illuminate\\Database\\Eloquent\\Model");
        }

        return $this->model = $model;
    }

    public function all(array $columns = ['*']): Collection
    {
        return $this->model->all($columns);
    }

    public function find($id, array $columns = ['*']): ?Model
    {
        return $this->model->find($id, $columns);
    }

    public function findOrFail($id, array $columns = ['*']): Model
    {
        return $this->model->findOrFail($id, $columns);
    }

    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    public function update($id, array $data): Model
    {
        $record = $this->findOrFail($id);
        $record->update($data);
        return $record;
    }

    public function delete($id): bool
    {
        return (bool) $this->findOrFail($id)->delete();
    }

    public function paginate($perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->model->paginate($perPage, $columns);
    }

    public function findByField($field, $value, array $columns = ['*']): ?Model
    {
        return $this->model->where($field, $value)->first($columns);
    }

    public function where(array $conditions, array $columns = ['*']): Collection
    {
        return $this->model->where($conditions)->get($columns);
    }

    public function updateOrCreate(array $attributes, array $values = []): Model
    {
        return $this->model->updateOrCreate($attributes, $values);
    }
}
