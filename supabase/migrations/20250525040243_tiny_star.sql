/*
  # Payment and Maintenance Updates

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `lease_id` (uuid, foreign key)
      - `amount` (numeric)
      - `payment_date` (timestamp)
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `method` (text) - 'cash'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes to maintenance_requests
    - Add `ticket_number` column
    - Add trigger to auto-generate ticket numbers

  3. Security
    - Enable RLS on payments table
    - Add policies for tenants and landlords
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id uuid REFERENCES leases(id) ON DELETE CASCADE,
    amount numeric NOT NULL CHECK (amount > 0),
    payment_date date NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    method text NOT NULL CHECK (method = 'cash') DEFAULT 'cash',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add ticket number to maintenance requests
ALTER TABLE maintenance_requests 
ADD COLUMN IF NOT EXISTS ticket_number text UNIQUE;

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number := 'TKT-' || to_char(NEW.submitted_date, 'YYYYMMDD') || '-' || 
                        LPAD(COALESCE(
                            (SELECT COUNT(*) + 1 FROM maintenance_requests 
                             WHERE DATE(submitted_date) = DATE(NEW.submitted_date))::text,
                            '1'
                        ), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket number generation
DROP TRIGGER IF EXISTS set_ticket_number ON maintenance_requests;
CREATE TRIGGER set_ticket_number
    BEFORE INSERT ON maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_number();

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments
CREATE POLICY "Tenants can view their own payments"
    ON payments FOR SELECT
    TO authenticated
    USING (lease_id IN (
        SELECT id FROM leases WHERE tenant_id = auth.uid()
    ));

CREATE POLICY "Landlords can view payments for their properties"
    ON payments FOR SELECT
    TO authenticated
    USING (lease_id IN (
        SELECT id FROM leases WHERE landlord_id = auth.uid()
    ));

CREATE POLICY "Tenants can create pending payments"
    ON payments FOR INSERT
    TO authenticated
    WITH CHECK (
        lease_id IN (
            SELECT id FROM leases 
            WHERE tenant_id = auth.uid() 
            AND status = 'active'
        )
        AND status = 'pending'
    );

CREATE POLICY "Landlords can update payment status"
    ON payments FOR UPDATE
    TO authenticated
    USING (
        lease_id IN (
            SELECT id FROM leases WHERE landlord_id = auth.uid()
        )
    )
    WITH CHECK (
        lease_id IN (
            SELECT id FROM leases WHERE landlord_id = auth.uid()
        )
    );