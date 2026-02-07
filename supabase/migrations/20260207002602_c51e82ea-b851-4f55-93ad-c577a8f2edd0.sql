-- Allow character owners to insert combat stat events for their own characters
CREATE POLICY "Character owners can insert combat events"
ON public.combat_stat_events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.characters
    WHERE characters.id = combat_stat_events.character_id
    AND characters.user_id = auth.uid()
  )
  AND is_campaign_member(campaign_id)
);
