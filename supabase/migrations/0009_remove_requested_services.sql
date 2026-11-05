-- Remove services requested to be taken off the public menu.
delete from public.services
where lower(name) like '%gel removal with serv%'
   or lower(name) like '%male pedicure%'
   or lower(name) like '%vip pedi%'
   or lower(slug) like '%gel-removal-with-serv%'
   or lower(slug) like '%male-pedicure%'
   or lower(slug) like '%vip-pedi%';
