alter type public.trip_status add value if not exists 'traveling' after 'confirmed';
alter type public.trip_status add value if not exists 'at_client' after 'traveling';
alter type public.trip_status add value if not exists 'in_service' after 'at_client';
alter type public.trip_status add value if not exists 'returning' after 'in_service';
alter type public.trip_status add value if not exists 'finished' after 'returning';
