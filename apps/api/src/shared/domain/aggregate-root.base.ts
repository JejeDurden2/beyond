import { Entity, EntityProps } from './entity.base';

export abstract class AggregateRoot<T extends EntityProps> extends Entity<T> {
  constructor(props: T) {
    super(props);
  }
}
