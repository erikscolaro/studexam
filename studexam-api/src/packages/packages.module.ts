import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { PackageEntity } from './entities/package.entity';
import { TagEntity } from 'src/tags/entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PackageEntity, TagEntity])],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}