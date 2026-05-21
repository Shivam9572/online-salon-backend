import { Server } from 'socket.io';
import {Provider} from '../models/association.js';
import {Staff} from '../models/association.js'; // ✅ Staff model import
import jwt from "jsonwebtoken";

const providers = {};

export default function socketConnect(server) {
    const io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_ORIGIN,process.env.FRONTEND_USER],
            credentials: true,
             methods: ["GET", "POST"] ,
              
        },
        pingTimeout: 60000,   // ✅ add karo
        pingInterval: 25000,
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token || 
              socket.handshake.headers.authorization?.split(' ')[1];
                
            
            if (!token) return next(new Error('Token missing'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.data.user = decoded;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        const id = socket.data.user.id;
      
        if (socket.data.user.role === "provider" && !providers[id]) {
            try {
                await Provider.update({ available: true }, { where: { id } });
                providers[id] = socket.id;
                console.log("✅ Provider online:", id);
            } catch (error) {
                console.log(error);
            }
        }

        // ✅ Staff toggle event
        socket.on('staff_toggle', async ({ staffId, available }) => {
            try {
                const providerId = socket.data.user.id;

                // Verify — yeh staff is provider ka hi hai?
                const staff = await Staff.findOne({
                    where: { id: staffId, provider_id: providerId }
                });

                if (!staff) {
                    socket.emit('staff_toggle_error', {
                        staffId,
                        message: 'Staff not found'
                    });
                    return;
                }

                await Staff.update(
                    { available },
                    { where: { id: staffId, provider_id: providerId } }
                );

                // ✅ Confirm back karo frontend ko
                socket.emit('staff_toggle_success', { staffId, available });
               

            } catch (error) {
                console.log(error);
                socket.emit('staff_toggle_error', {
                    staffId,
                    message: 'Failed to update'
                });
            }
        });

        socket.on('disconnect', async () => {
            try {
                await Provider.update({ available: false }, { where: { id } });
                await Staff.update({available:false},{
                    where:{
                        provider_id:id
                    }
                })
                delete providers[id];
               
            } catch (error) {
                console.log(error);
            }
        });
    });
}