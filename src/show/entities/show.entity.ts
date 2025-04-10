import { ReservationEntity } from 'src/reservation/entities/reservation.entity';
import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    VersionColumn,
} from 'typeorm';

@Entity('show')
@Unique(['showDate'])
export class ShowEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    showDate: Date;

    @Column({ type: 'int' })
    seatCount: number;

    @OneToMany(() => ReservationEntity, reservation => reservation.show)
    reservations: ReservationEntity[];

    @VersionColumn()
    version: number;
}
