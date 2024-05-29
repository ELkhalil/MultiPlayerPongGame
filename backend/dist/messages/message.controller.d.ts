import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    create(roomId: string, createMessageDto: CreateMessageDto, userId: string): Promise<import("@nestjs/common").HttpException>;
    findAll(roomId: string, userId: string): Promise<void>;
}
