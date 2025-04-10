import { Controller, Post, Body } from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateSampleShowDto } from './dto/create-show.dto';

@Controller('show')
export class ShowController {
    constructor(private readonly showService: ShowService) {}

    @Post('sample')
    sampleShow(@Body() createSampleShowDto: CreateSampleShowDto) {
        return this.showService.sampleShow(createSampleShowDto);
    }
}
