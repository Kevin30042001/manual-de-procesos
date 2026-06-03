-- Manual de Procesos — seed data
-- Run this in Supabase SQL Editor AFTER schema.sql and AFTER creating the admin user

do $$
declare
  gls_id   uuid;
  atlas_id uuid;
  yms_id   uuid;
  voco_id  uuid;
  snow_id  uuid;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid;
  admin_id uuid;
begin
  -- Get admin user id (assumes the first user in auth.users is the admin)
  select id into admin_id from auth.users order by created_at limit 1;

  -- Insert systems
  insert into systems (name, color) values ('GLS',        '#5f8a6f') returning id into gls_id;
  insert into systems (name, color) values ('Atlas',      '#5b7a99') returning id into atlas_id;
  insert into systems (name, color) values ('YMS',        '#b07a56') returning id into yms_id;
  insert into systems (name, color) values ('Vocollege',  '#8a6f8f') returning id into voco_id;
  insert into systems (name, color) values ('ServiceNow', '#9b6a6a') returning id into snow_id;

  -- Process 1: GLS Slots
  insert into processes (system_id, title, category, tags, created_by)
  values (gls_id, 'Modificación de % y capacidades de slots', 'Mantenimiento de ubicaciones',
          '{"slots","GLS","ubicaciones"}', admin_id)
  returning id into p1;

  insert into steps (process_id, "order", text, warning) values
    (p1, 0, 'Abrir GLS.', null),
    (p1, 1, 'En el menú elegir "Order Processing".', null),
    (p1, 2, 'Entrar a "Maintenance".', null),
    (p1, 3, 'Seleccionar "Slots".', null),
    (p1, 4, 'Abrir "Slots Maintenance".', null),
    (p1, 5, 'Consultar el slot a modificar.', null),
    (p1, 6, 'Seleccionar el slot.', null),
    (p1, 7, 'Dar clic en "Update".', null),
    (p1, 8, 'Colocar los datos a actualizar y guardar.',
     'No modificar la zona ni el código de ubicación. Solo se pueden cambiar el % y la capacidad.');

  -- Process 2: Atlas usuarios
  insert into processes (system_id, title, category, tags, created_by)
  values (atlas_id, 'Agregar usuario al sistema', 'Administración de accesos',
          '{"usuarios","Atlas","accesos"}', admin_id)
  returning id into p2;

  insert into steps (process_id, "order", text, warning) values
    (p2, 0, 'Iniciar sesión en Atlas con credenciales de administrador.', null),
    (p2, 1, 'Ir al módulo de Administración → Usuarios.', null),
    (p2, 2, 'Hacer clic en "Nuevo usuario".', null),
    (p2, 3, 'Completar los campos: nombre, apellido, correo y número de empleado.', null),
    (p2, 4, 'En el campo "Domain" dejar el valor predeterminado.',
     'El campo Domain NO se modifica. Dejarlo con el valor que aparece por defecto.'),
    (p2, 5, 'Asignar el rol correspondiente al usuario.', null),
    (p2, 6, 'Guardar y confirmar que el usuario aparece en la lista.', null);

  -- Process 3: GLS rol
  insert into processes (system_id, title, category, tags, created_by)
  values (gls_id, 'Agregar rol a un usuario', 'Administración de accesos',
          '{"roles","GLS","usuarios"}', admin_id)
  returning id into p3;

  insert into steps (process_id, "order", text, warning) values
    (p3, 0, 'Abrir GLS e ir a Administración → Usuarios.', null),
    (p3, 1, 'Buscar el usuario al que se le asignará el rol.', null),
    (p3, 2, 'Seleccionar el usuario y hacer clic en "Editar".', null),
    (p3, 3, 'En la pestaña "Roles" hacer clic en "Agregar rol".', null),
    (p3, 4, 'Seleccionar el rol de la lista y confirmar.', null),
    (p3, 5, 'Guardar los cambios.', null);

  -- Process 4: YMS Gate In
  insert into processes (system_id, title, category, tags, created_by)
  values (yms_id, 'Registrar entrada de tráiler (Gate In)', 'Patio / Yard',
          '{"trailers","YMS","patio","gate in"}', admin_id)
  returning id into p4;

  insert into steps (process_id, "order", text, warning) values
    (p4, 0, 'Iniciar sesión en YMS.', null),
    (p4, 1, 'Ir al módulo "Gate" → "Inbound".', null),
    (p4, 2, 'Hacer clic en "Check In".', null),
    (p4, 3, 'Ingresar el número de sello y número de tráiler.', null),
    (p4, 4, 'Seleccionar el transportista y confirmar la cita si aplica.', null),
    (p4, 5, 'Asignar puerta de destino dentro del patio.', null),
    (p4, 6, 'Guardar. El sistema genera el número de movimiento.', null);

  -- Process 5: Vocollege
  insert into processes (system_id, title, category, tags, created_by)
  values (voco_id, 'Asignar tarea de voz a un operador', 'Operación de voz',
          '{"voz","tarea","operador","Vocollege"}', admin_id)
  returning id into p5;

  insert into steps (process_id, "order", text, warning) values
    (p5, 0, 'Abrir Vocollege Management Console.', null),
    (p5, 1, 'Ir a "Operadores" y buscar al operador por nombre o ID.', null),
    (p5, 2, 'Seleccionar el operador y hacer clic en "Asignar tarea".', null),
    (p5, 3, 'Elegir el tipo de tarea (picking, reabasto, etc.) y el área.', null),
    (p5, 4, 'Confirmar la asignación. El operador recibirá la instrucción en su headset.', null);

  -- Process 6: ServiceNow ticket
  insert into processes (system_id, title, category, tags, created_by)
  values (snow_id, 'Levantar un ticket de incidencia', 'Soporte / Mesa de ayuda',
          '{"ticket","incidencia","ServiceNow","soporte"}', admin_id)
  returning id into p6;

  insert into steps (process_id, "order", text, warning) values
    (p6, 0, 'Iniciar sesión en ServiceNow con tus credenciales corporativas.', null),
    (p6, 1, 'Ir a "Create New" → seleccionar "Incident".', null),
    (p6, 2, 'Seleccionar la categoría y subcategoría correctas, y asignar la prioridad.', null),
    (p6, 3, 'Describir la incidencia con el mayor detalle posible: qué ocurrió, cuándo, qué sistema.', null),
    (p6, 4, 'Adjuntar una captura de pantalla del error si está disponible.', null),
    (p6, 5, 'Enviar el ticket y anotar el número generado (INC…) para seguimiento.',
     'No cerrar el ticket hasta recibir confirmación de que la solución fue verificada.');
end $$;
