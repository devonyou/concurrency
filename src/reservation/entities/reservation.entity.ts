import { ShowEntity } from 'src/show/entities/show.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reservation')
export class ReservationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ShowEntity, show => show.id, { onDelete: 'CASCADE' })
    show: ShowEntity;

    @Column()
    userId: string;
}
