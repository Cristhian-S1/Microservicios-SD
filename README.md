Los archivos .sh se ejecutan para instalar los node_modules o iniciar todos los microservicios, es importante verificar que los puertos 3000-3006 no esten en uso, de no ser asi causara failures.

```sql
delete from usuario;
delete from producto;
delete from producto_usuario;
delete from categoria;
delete from venta;

drop table usuario;
drop table producto;
drop table producto_usuario;
drop table categoria;
drop table venta;

create table usuario (
   us_id               integer generated always as identity primary key,
   us_nombre           varchar(56),
   us_icono            varchar(256),
   us_fecha_nacimiento date,
   us_email            varchar(126),
   us_contrasena       varchar(126)
);


create table producto (
   pr_id        integer generated always as identity primary key,
   pr_nombre    varchar(56),
   pr_precio    integer,
   pr_imagen    varchar(256),
   pr_eliminado integer,
   ct_id        integer
);

create table producto_usuario (
   pu_id       integer generated always as identity primary key,
   pu_cantidad integer,
   us_id       integer,
   pr_id       integer,
   vt_id       integer
);

create table categoria (
   ct_id        integer generated always as identity primary key,
   ct_nombre    varchar(56),
   ct_eliminado integer
);

create table venta (
   vt_id    integer generated always as identity primary key,
   vt_fecha date
);

--Poblacion
--1) Usuarios --> 3 usuarios: 2 clientes y un 1 administrador
insert into usuario (
   us_nombre,
   us_icono,
   us_fecha_nacimiento,
   us_email,
   us_contrasena
) values ( 'Juan Pérez',
           'icono1.png',
           '1995-04-12',
           'juan@cliente.com',
           'pass123' ),( 'María López',
                         'icono2.png',
                         '1992-11-30',
                         'maria@cliente.com',
                         'pass456' ),( 'Admin System',
                                       'adminicon.png',
                                       '1980-01-01',
                                       'admin@sistema.com',
                                       'admin123' );

--2) Categorias
insert into categoria ( ct_nombre ) values ( 'Electrónica' ),( 'Hogar' ),( 'Ropa' ),( 'Accesorios' );

--3) Productos (12 productos: 3 por categoría)
insert into producto (
   pr_nombre,
   pr_precio,
   pr_imagen,
   ct_id
) values ( 'Audífonos Bluetooth',
           19990,
           'audifonos.png',
           1 ),( 'Teclado Mecánico',
                 34990,
                 'teclado.png',
                 1 ),( 'Mouse Gamer',
                       24990,
                       'mouse.png',
                       1 ),( 'Tetera Eléctrica',
                             15990,
                             'tetera.png',
                             2 ),( 'Aspiradora Manual',
                                   29990,
                                   'aspiradora.png',
                                   2 ),( 'Lampara LED',
                                         9990,
                                         'lampara.png',
                                         2 ),( 'Polera Negra',
                                               8990,
                                               'polera.png',
                                               3 ),( 'Pantalón Jeans',
                                                     19990,
                                                     'jeans.png',
                                                     3 ),( 'Chaqueta Impermeable',
                                                           34990,
                                                           'chaqueta.png',
                                                           3 ),( 'Mochila Urbana',
                                                                 24990,
                                                                 'mochila.png',
                                                                 4 ),( 'Gorra Deportiva',
                                                                       7990,
                                                                       'gorra.png',
                                                                       4 ),( 'Reloj Digital',
                                                                             14990,
                                                                             'reloj.png',
                                                                             4 );


--4) Ventas
insert into venta ( vt_fecha ) values ( '2025-02-10' ),( '2025-02-11' );

--5)
/*
Venta #1 (Juan)
(2, 1, 1, 1),  -- 2 Audífonos
(1, 1, 4, 1),  -- 1 Tetera
(1, 1, 10, 1), -- 1 Mochila

Venta #2 (María)
(1, 2, 3, 2),  -- 1 Mouse Gamer
(2, 2, 7, 2),  -- 2 Poleras
(1, 2, 12, 2); -- 1 Reloj Digital
*/

insert into producto_usuario (
   pu_cantidad,
   us_id,
   pr_id,
   vt_id
) values ( 2,
           1,
           1,
           1 ),( 1,
                 1,
                 4,
                 1 ),( 1,
                       1,
                       10,
                       1 ),( 1,
                             2,
                             3,
                             2 ),( 2,
                                   2,
                                   7,
                                   2 ),( 1,
                                         2,
                                         12,
                                         2 );


insert into producto_usuario (
   pu_cantidad,
   us_id,
   pr_id
) values ( 1,
           1,
           3 ),( 4,
                 1,
                 6 );

--Consultas para los endpoints de los usuarios cliente y administrador

--Autencacion con us_contrasena codificada
select case
          when exists (
             select 1
               from usuario
              where us_email = 'juan@cliente.com'
                and us_contrasena = 'pass123'
          ) then
             1
          else
             0
       end as resultado;

select *
  from usuario;

--Usuario
--1) Obtener todos los productos 
select *
  from producto
 where pr_eliminado is null;

 --2) Mostrar categorias
select *
  from categoria
 where ct_eliminado is null;

--3) Obtener todos los productos segun una categoria (recibe ct_id)
select *
  from producto
 where ct_id = 1
   and pr_eliminado is null;

--4) Ver el carrito de la persona (recibe us_id)
select *
  from producto_usuario
  join producto
using ( pr_id )
 where us_id = 1
   and vt_id is null;

select *
  from producto_usuario;

update producto_usuario
   set
   vt_id = null
 where us_id = 1;

--5) Ver compra de la persona (recibe us_id)
select *
  from producto_usuario
  join producto
using ( pr_id )
 where us_id = 1
   and vt_id is not null
   and pr_eliminado is null;

 --6) Insertar un producto al carrito (recibe pu_cantidad, us_id, pr_id)

insert into producto_usuario (
   pu_cantidad,
   us_id,
   pr_id
) values ( 1,
           1,
           2 );  

 --7) Concretar una compra(crea un registro de venta y lo asocia al nuevo registro de producto_usuario)
insert into venta ( vt_fecha ) values ( current_date );

insert into producto_usuario (
   pu_cantidad,
   us_id,
   pr_id,
   vt_id
) values ( 1,
           1,
           2,
           3 ); 

--Administrador
--1) Crear un producto (recibe los parametros necesarios de creacion)
insert into producto (
   pr_nombre,
   pr_precio,
   pr_imagen,
   ct_id
) values ( 'Tablero de damas',
           19990,
           'tablero.png',
           1 );

--2) Actualizar un producto (de tipo patch)
    --Por ejemplo
update producto
   set
   pr_nombre = 'Sombrero'
 where pr_id = 1;

--3) Eliminar un producto (recibe el id del producto)
update producto
   set
   pr_eliminado = 1
 where pr_id = 2;

--4) Crear, actualizar(de tipo patch) y eliminar(cambiar ct_eliminado a 1) una categoria

select *
  from usuario;
commit;
select *
  from producto
 where pr_eliminado is null
 order by pr_id;

select *
  from producto_usuario
  join producto
using ( pr_id )
 order by pu_id;

select *
  from producto;

select *
  from usuario;

select *
  from categoria;

select *
  from venta;

select *
  from producto_usuario;

```
