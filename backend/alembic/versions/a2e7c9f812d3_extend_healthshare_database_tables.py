"""extend_healthshare_database_tables

Revision ID: a2e7c9f812d3
Revises: 510a4ee0bb51
Create Date: 2026-07-30 20:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a2e7c9f812d3'
down_revision = '510a4ee0bb51'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create patient_profiles table
    op.create_table(
        'patient_profiles',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('blood_group', sa.String(length=10), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('emergency_contact', sa.String(length=100), nullable=True),
        sa.Column('height_cm', sa.Float(), nullable=True),
        sa.Column('weight_kg', sa.Float(), nullable=True),
        sa.Column('allergies', sa.Text(), nullable=True),
        sa.Column('chronic_conditions', sa.Text(), nullable=True),
        sa.Column('profile_completed', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_patient_profiles_id'), 'patient_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_patient_profiles_user_id'), 'patient_profiles', ['user_id'], unique=True)

    # 2. Create doctor_profiles table
    op.create_table(
        'doctor_profiles',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('specialization', sa.String(length=100), nullable=True),
        sa.Column('hospital', sa.String(length=255), nullable=True),
        sa.Column('department', sa.String(length=100), nullable=True),
        sa.Column('license_number', sa.String(length=100), nullable=True),
        sa.Column('experience_years', sa.Integer(), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_doctor_profiles_id'), 'doctor_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_doctor_profiles_user_id'), 'doctor_profiles', ['user_id'], unique=True)

    # 3. Create researcher_profiles table
    op.create_table(
        'researcher_profiles',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('institution', sa.String(length=255), nullable=True),
        sa.Column('department', sa.String(length=100), nullable=True),
        sa.Column('designation', sa.String(length=100), nullable=True),
        sa.Column('research_area', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_researcher_profiles_id'), 'researcher_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_researcher_profiles_user_id'), 'researcher_profiles', ['user_id'], unique=True)

    # 4. Create appointments table
    op.create_table(
        'appointments',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('patient_id', sa.BigInteger(), nullable=False),
        sa.Column('doctor_id', sa.BigInteger(), nullable=False),
        sa.Column('appointment_date', sa.Date(), nullable=False),
        sa.Column('appointment_time', sa.Time(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='Pending'),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('meeting_mode', sa.String(length=50), nullable=False, server_default='In-Person'),
        sa.Column('doctor_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['doctor_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_appointments_id'), 'appointments', ['id'], unique=False)
    op.create_index(op.f('ix_appointments_patient_id'), 'appointments', ['patient_id'], unique=False)
    op.create_index(op.f('ix_appointments_doctor_id'), 'appointments', ['doctor_id'], unique=False)
    op.create_index(op.f('ix_appointments_appointment_date'), 'appointments', ['appointment_date'], unique=False)
    op.create_index(op.f('ix_appointments_status'), 'appointments', ['status'], unique=False)

    # 5. Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)
    op.create_index(op.f('ix_notifications_type'), 'notifications', ['type'], unique=False)

    # 6. Create ai_predictions table
    op.create_table(
        'ai_predictions',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('patient_id', sa.BigInteger(), nullable=False),
        sa.Column('prediction_type', sa.String(length=50), nullable=False),
        sa.Column('result', sa.String(length=255), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('model_version', sa.String(length=50), nullable=False),
        sa.Column('report_path', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_predictions_id'), 'ai_predictions', ['id'], unique=False)
    op.create_index(op.f('ix_ai_predictions_patient_id'), 'ai_predictions', ['patient_id'], unique=False)
    op.create_index(op.f('ix_ai_predictions_prediction_type'), 'ai_predictions', ['prediction_type'], unique=False)

    # 7. Create prescriptions table
    op.create_table(
        'prescriptions',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('appointment_id', sa.BigInteger(), nullable=True),
        sa.Column('doctor_id', sa.BigInteger(), nullable=False),
        sa.Column('patient_id', sa.BigInteger(), nullable=False),
        sa.Column('diagnosis', sa.Text(), nullable=False),
        sa.Column('medications', sa.Text(), nullable=False),
        sa.Column('lab_tests', sa.Text(), nullable=True),
        sa.Column('follow_up_date', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['doctor_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_prescriptions_id'), 'prescriptions', ['id'], unique=False)
    op.create_index(op.f('ix_prescriptions_appointment_id'), 'prescriptions', ['appointment_id'], unique=False)
    op.create_index(op.f('ix_prescriptions_doctor_id'), 'prescriptions', ['doctor_id'], unique=False)
    op.create_index(op.f('ix_prescriptions_patient_id'), 'prescriptions', ['patient_id'], unique=False)

    # 8. Extend consents table
    op.add_column('consents', sa.Column('status', sa.String(length=50), nullable=False, server_default='Pending'))
    op.add_column('consents', sa.Column('purpose', sa.Text(), nullable=True))
    op.add_column('consents', sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('consents', sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True))

    # 9. Extend access_requests table
    op.add_column('access_requests', sa.Column('requested_duration', sa.String(length=50), nullable=True))
    op.add_column('access_requests', sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('access_requests', sa.Column('response_message', sa.Text(), nullable=True))


def downgrade() -> None:
    # 1. Rollback access_requests extensions
    op.drop_column('access_requests', 'response_message')
    op.drop_column('access_requests', 'expires_at')
    op.drop_column('access_requests', 'requested_duration')

    # 2. Rollback consents extensions
    op.drop_column('consents', 'expires_at')
    op.drop_column('consents', 'approved_at')
    op.drop_column('consents', 'purpose')
    op.drop_column('consents', 'status')

    # 3. Drop prescriptions
    op.drop_index(op.f('ix_prescriptions_patient_id'), table_name='prescriptions')
    op.drop_index(op.f('ix_prescriptions_doctor_id'), table_name='prescriptions')
    op.drop_index(op.f('ix_prescriptions_appointment_id'), table_name='prescriptions')
    op.drop_index(op.f('ix_prescriptions_id'), table_name='prescriptions')
    op.drop_table('prescriptions')

    # 4. Drop ai_predictions
    op.drop_index(op.f('ix_ai_predictions_prediction_type'), table_name='ai_predictions')
    op.drop_index(op.f('ix_ai_predictions_patient_id'), table_name='ai_predictions')
    op.drop_index(op.f('ix_ai_predictions_id'), table_name='ai_predictions')
    op.drop_table('ai_predictions')

    # 5. Drop notifications
    op.drop_index(op.f('ix_notifications_type'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')

    # 6. Drop appointments
    op.drop_index(op.f('ix_appointments_status'), table_name='appointments')
    op.drop_index(op.f('ix_appointments_appointment_date'), table_name='appointments')
    op.drop_index(op.f('ix_appointments_doctor_id'), table_name='appointments')
    op.drop_index(op.f('ix_appointments_patient_id'), table_name='appointments')
    op.drop_index(op.f('ix_appointments_id'), table_name='appointments')
    op.drop_table('appointments')

    # 7. Drop researcher_profiles
    op.drop_index(op.f('ix_researcher_profiles_user_id'), table_name='researcher_profiles')
    op.drop_index(op.f('ix_researcher_profiles_id'), table_name='researcher_profiles')
    op.drop_table('researcher_profiles')

    # 8. Drop doctor_profiles
    op.drop_index(op.f('ix_doctor_profiles_user_id'), table_name='doctor_profiles')
    op.drop_index(op.f('ix_doctor_profiles_id'), table_name='doctor_profiles')
    op.drop_table('doctor_profiles')

    # 9. Drop patient_profiles
    op.drop_index(op.f('ix_patient_profiles_user_id'), table_name='patient_profiles')
    op.drop_index(op.f('ix_patient_profiles_id'), table_name='patient_profiles')
    op.drop_table('patient_profiles')
