export interface IReadableRepository<T> {
  getById(id: string): Promise<T | null>;
}

export interface ICreatableRepository<TCreate, TResult> {
  create(data: TCreate): Promise<TResult | undefined>;
}

export interface IUpdatableRepository<TUpdate, TResult> {
  update(id: string, dat: TUpdate): Promise<TResult | undefined>;
}

export interface IDeletableRepository {
  delete(id: string): Promise<void>;
}
