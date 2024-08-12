import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { Repository } from 'typeorm';
import { CreateWorkflowDto } from '@app/workflows';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
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
    console.log(
      JSON.stringify({ name: 'My workflow', buildingId } as CreateWorkflowDto),
    );
    const response = await fetch('http://workflows-service:3001/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My workflow', buildingId }),
    });
    const newWorkflow = await response.json();
    console.log({ newWorkflow });
    return newWorkflow;
  }
}
