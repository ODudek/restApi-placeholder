import bodyParser from 'body-parser';
import compression from 'compression';
import { Config } from 'config/api.conf';
import cors from 'cors';
import express from 'express';
import { errorLogger, logger } from 'helpers/logger';
import mongoose from 'mongoose';
import { PhotoRoutes } from 'routes/photo';
import { PostRoutes } from 'routes/post';
import { UserRoutes } from 'routes/user';

const options = {
    connectTimeoutMS: 3000,
    socketTimeoutMS: 3000,
    useNewUrlParser: true,
};

export class App {

    public app: express.Application;
    public userRoute: UserRoutes = new UserRoutes();
    public mongoUrl: string = Config.mongoURL;
    public port: string | number;
    public postRoute: PostRoutes = new PostRoutes();
    public photoRoute: PhotoRoutes = new PhotoRoutes();

    constructor(port: string | number) {
        this.port = port;
        this.app = express();
        this.config();
        this.mongoSetup();
        this.userRoute.routes(this.app);
        this.postRoute.routes(this.app);
        this.photoRoute.routes(this.app);
    }

    private config(): void {
        this.app.use(compression());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cors({ exposedHeaders: ['X-Content-Length'] }));
        this.app.options('*', cors());
    }

    private mongoSetup(): void {
        mongoose.Promise = global.Promise;
        mongoose
            .connect(this.mongoUrl, options)
            .then(() => {
                logger('Connected to database!');
                this.app.listen(this.port, () => {
                    logger(`Listening at http://localhost:${this.port}`);
                });
            })
            .catch((err: Error) => {
                errorLogger('Not connected!', err.name);
            });
    }
}
