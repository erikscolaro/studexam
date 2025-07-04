import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser()); // Enable cookie parsing for JWT in cookies

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // we enable transform to automatically convert the payload too the desired type
      // remember to specify in the signature of methods the types!
    }),
  ); // Automatically manages validation of classes with calss-validator
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}

bootstrap();

//To force query and param types to int or string the docuemtnation suggests this pattenr
//
// import { IsNumberString } from 'class-validator';
//
// export class FindOneParams {
//  @IsNumberString()
//  id: string;
//}
////

// Joking ! you can do the autommatic cast this way
//@Get(':id/prodotto/:pid')
//getProduct(
//  @Param('id') id: number,
//  @Param('pid') pid: number,
//) {
//  console.log(typeof id === 'number');  // true
//  console.log(typeof pid === 'number'); // true
//  // ...
//}
//

// It seems like the automatic cast of single entry does not fork for the body
// you need a dto object here, we need to verify that
