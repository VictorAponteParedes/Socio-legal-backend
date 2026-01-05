import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { User } from '@/users/entities/user.entity';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async getMyProfile(userId: string) {
        const client = await this.clientRepository.findOne({
            where: { user_id: userId },
            relations: ['user'],
        });

        if (!client) {
            throw new NotFoundException('Perfil de cliente no encontrado para este usuario');
        }

        return client;
    }

    async updateMyProfile(userId: string, data: UpdateClientProfileDto) {
        const client = await this.clientRepository.findOne({
            where: { user_id: userId },
            relations: ['user'],
        });

        if (!client) {
            throw new NotFoundException('Cliente no encontrado');
        }
        const userDataToUpdate: Partial<User> = {};
        if (data.name) userDataToUpdate.name = data.name;
        if (data.lastname) userDataToUpdate.lastname = data.lastname;
        if (data.phone) userDataToUpdate.phone = data.phone;
        if (data.cedula) userDataToUpdate.cedula = data.cedula;

        if (Object.keys(userDataToUpdate).length > 0) {
            await this.userRepository.update(userId, userDataToUpdate);
        }

        const clientDataToUpdate: Partial<Client> = {};
        if (data.address) clientDataToUpdate.address = data.address;
        if (data.city) clientDataToUpdate.city = data.city;
        if (data.country) clientDataToUpdate.country = data.country;

        if (Object.keys(clientDataToUpdate).length > 0) {
            await this.clientRepository.update(client.id, clientDataToUpdate);
        }

        return this.getMyProfile(userId);
    }
}
