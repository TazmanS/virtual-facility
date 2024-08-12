import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from '@app/workflows';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowsRepository: Repository<Workflow>,
  ) {}

  async findAll(): Promise<Workflow[]> {
    return this.workflowsRepository.find();
  }

  async findOne(id: number): Promise<Workflow> {
    const workflow = await this.workflowsRepository.findOne({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }
    return workflow;
  }

  async create(crateWorkflowDto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = await this.workflowsRepository.create({
      ...crateWorkflowDto,
    });
    const newWorkflowEntity = await this.workflowsRepository.save(workflow);
    return newWorkflowEntity;
  }

  async update(
    id: number,
    updateWorkflowDto: UpdateWorkflowDto,
  ): Promise<Workflow> {
    const workflow = await this.workflowsRepository.preload({
      id: +id,
      ...updateWorkflowDto,
    });
    if (!workflow) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }
    return this.workflowsRepository.save(workflow);
  }

  async remove(id: number): Promise<Workflow> {
    const workflow = await this.workflowsRepository.findOne({ where: { id } });
    return await this.workflowsRepository.remove(workflow);
  }
}
