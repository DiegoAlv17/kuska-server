export type PriorityLevel = 'baja' | 'media' | 'alta' | 'critica';

export class PriorityVO {
  private value: PriorityLevel;

  constructor(value: PriorityLevel) {
    this.validate(value);
    this.value = value;
  }

  private validate(value: PriorityLevel) {
    const allowed: PriorityLevel[] = ['baja', 'media', 'alta', 'critica'];
    if (!allowed.includes(value)) {
      throw new Error(`Invalid priority value: ${value}`);
    }
  }

  getValue(): PriorityLevel {
    return this.value;
  }
}

export default PriorityVO;
