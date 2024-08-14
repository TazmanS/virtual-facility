import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { Repository } from 'typeorm';
import { CreateWorkflowDto } from '@app/workflows';
import { WORKFLOWS_SERVICE } from '../constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @Inject(WORKFLOWS_SERVICE)
    private readonly workflowsService: ClientProxy,
  ) {}

  async findAll(): Promise<Building[]> {
    return this.buildingRepository.find();
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.buildingRepository.findOne({ where: { id } });
    if (!building) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }
    return building;
  }

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const building = await this.buildingRepository.create({
      ...createBuildingDto,
    });
    const newBuildEntity = await this.buildingRepository.save(building);

    await this.createWorkFlow(newBuildEntity.id);
    return newBuildEntity;
  }

  async update(
    id: number,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    const building = await this.buildingRepository.preload({
      id: +id,
      ...updateBuildingDto,
    });
    if (!building) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }
    return this.buildingRepository.save(building);
  }

  async remove(id: number): Promise<Building> {
    const building = await this.buildingRepository.findOne({ where: { id } });
    return await this.buildingRepository.remove(building);
  }

  async createWorkFlow(buildingId: number) {
    const newWorkflow = await lastValueFrom(
      this.workflowsService.send('workflows.create', {
        name: 'My building',
        buildingId,
      } as CreateWorkflowDto),
    );
    console.log({ newWorkflow });
    return newWorkflow;
  }
}
