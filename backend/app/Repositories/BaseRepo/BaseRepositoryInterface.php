<?php

namespace App\Repositories\BaseRepo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BaseRepositoryInterface
{
    public function all(array $columns = ['*']): Collection;
    public function find($id, array $columns = ['*']): ?Model;
    public function findOrFail($id, array $columns = ['*']): Model;
    public function create(array $data): Model;
    public function update($id, array $data): Model;
    public function delete($id): bool;
    public function paginate($perPage = 15, array $columns = ['*']): LengthAwarePaginator;
    public function findByField($field, $value, array $columns = ['*']): ?Model;
    public function where(array $conditions, array $columns = ['*']): Collection;
    public function updateOrCreate(array $attributes, array $values = []): Model;
}
