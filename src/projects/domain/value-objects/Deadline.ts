export class DeadlineVO {
  private value: Date;

  constructor(value: Date) {
    this.value = value;
    this.validate();
  }

  private validate() {
    if (!(this.value instanceof Date) || isNaN(this.value.getTime())) {
      throw new Error('Invalid deadline date');
    }
  }

  getValue(): Date {
    return this.value;
  }
}

export default DeadlineVO;
