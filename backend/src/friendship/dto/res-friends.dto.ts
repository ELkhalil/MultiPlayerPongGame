export class res_friendship {
  constructor(result: any) {
    this.from = result?.from;
    this.to = result?.to;
    this.status = result?.status;
  }
    from: string;
    to: string;
    status: boolean;
}