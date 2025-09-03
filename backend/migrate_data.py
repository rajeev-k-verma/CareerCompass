#!/usr/bin/env python3
"""
Data Migration Script: Django to Express.js
This script migrates data from the Django backend to the new Express.js backend.
"""

import json
import os
import sqlite3
import psycopg2
from datetime import datetime
import hashlib

# Configuration
DJANGO_DB_PATH = "../frontend/db.sqlite3"  # Adjust path as needed
EXPRESS_DB_CONFIG = {
    'host': 'localhost',
    'database': 'resume_analyser',
    'user': 'postgres',
    'password': 'your_password',  # Update this
    'port': 5432
}

def connect_django_db():
    """Connect to Django SQLite database"""
    if not os.path.exists(DJANGO_DB_PATH):
        print(f"❌ Django database not found at {DJANGO_DB_PATH}")
        return None
    
    conn = sqlite3.connect(DJANGO_DB_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

def connect_express_db():
    """Connect to Express PostgreSQL database"""
    try:
        conn = psycopg2.connect(**EXPRESS_DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        print(f"❌ Failed to connect to PostgreSQL: {e}")
        return None

def migrate_users(django_conn, express_conn):
    """Migrate users from Django to Express"""
    print("👥 Migrating users...")
    
    django_cursor = django_conn.cursor()
    express_cursor = express_conn.cursor()
    
    # Get users from Django
    django_cursor.execute("""
        SELECT 
            id, username, email, first_name, last_name, 
            role, phone, location, experience_level, bio,
            skills, resume_uploaded, profile_complete,
            date_joined, last_login
        FROM authentication_user
    """)
    
    users = django_cursor.fetchall()
    migrated_count = 0
    
    for user in users:
        try:
            # Insert into Express database
            express_cursor.execute("""
                INSERT INTO users (
                    id, email, first_name, last_name, role, phone, 
                    location, experience_level, bio, skills, 
                    resume_uploaded, profile_complete, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (email) DO UPDATE SET
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    updated_at = EXCLUDED.updated_at
            """, (
                user['id'], user['email'], user['first_name'], user['last_name'],
                user['role'], user['phone'], user['location'], user['experience_level'],
                user['bio'], json.dumps(user['skills']) if user['skills'] else '[]',
                user['resume_uploaded'], user['profile_complete'],
                user['date_joined'], datetime.now()
            ))
            migrated_count += 1
        except Exception as e:
            print(f"⚠️  Failed to migrate user {user['email']}: {e}")
    
    express_conn.commit()
    print(f"✅ Migrated {migrated_count} users")

def migrate_jobs(django_conn, express_conn):
    """Migrate jobs from Django to Express"""
    print("💼 Migrating jobs...")
    
    django_cursor = django_conn.cursor()
    express_cursor = express_conn.cursor()
    
    # Get jobs from Django
    django_cursor.execute("""
        SELECT 
            id, title, company, description, requirements, location,
            salary_min, salary_max, salary_currency, is_remote,
            experience_level, skills, benefits, recruiter_id,
            status, applications_count, views_count, created_at, updated_at
        FROM jobs_job
    """)
    
    jobs = django_cursor.fetchall()
    migrated_count = 0
    
    for job in jobs:
        try:
            # Prepare salary object
            salary = None
            if job['salary_min'] or job['salary_max']:
                salary = {
                    'min': job['salary_min'],
                    'max': job['salary_max'],
                    'currency': job['salary_currency'] or 'USD'
                }
            
            # Insert into Express database
            express_cursor.execute("""
                INSERT INTO jobs (
                    id, title, company, description, requirements, location,
                    salary, is_remote, experience_level, skills, benefits,
                    recruiter_id, status, applications_count, views_count,
                    created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    updated_at = EXCLUDED.updated_at
            """, (
                job['id'], job['title'], job['company'], job['description'],
                json.dumps(job['requirements']) if job['requirements'] else '[]',
                job['location'], json.dumps(salary) if salary else None,
                job['is_remote'], job['experience_level'],
                json.dumps(job['skills']) if job['skills'] else '[]',
                json.dumps(job['benefits']) if job['benefits'] else '[]',
                job['recruiter_id'], job['status'], job['applications_count'],
                job['views_count'], job['created_at'], job['updated_at']
            ))
            migrated_count += 1
        except Exception as e:
            print(f"⚠️  Failed to migrate job {job['title']}: {e}")
    
    express_conn.commit()
    print(f"✅ Migrated {migrated_count} jobs")

def migrate_job_applications(django_conn, express_conn):
    """Migrate job applications from Django to Express"""
    print("📋 Migrating job applications...")
    
    django_cursor = django_conn.cursor()
    express_cursor = express_conn.cursor()
    
    # Get applications from Django
    django_cursor.execute("""
        SELECT 
            id, job_id, candidate_id, resume_id, cover_letter,
            status, applied_at, last_status_update
        FROM jobs_jobapplication
    """)
    
    applications = django_cursor.fetchall()
    migrated_count = 0
    
    for app in applications:
        try:
            # Insert into Express database
            express_cursor.execute("""
                INSERT INTO job_applications (
                    id, job_id, candidate_id, resume_id, cover_letter,
                    status, applied_at, last_status_update
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    status = EXCLUDED.status,
                    last_status_update = EXCLUDED.last_status_update
            """, (
                app['id'], app['job_id'], app['candidate_id'], app['resume_id'],
                app['cover_letter'], app['status'], app['applied_at'],
                app['last_status_update']
            ))
            migrated_count += 1
        except Exception as e:
            print(f"⚠️  Failed to migrate application {app['id']}: {e}")
    
    express_conn.commit()
    print(f"✅ Migrated {migrated_count} job applications")

def migrate_resumes(django_conn, express_conn):
    """Migrate resumes from Django to Express"""
    print("📄 Migrating resumes...")
    
    django_cursor = django_conn.cursor()
    express_cursor = express_conn.cursor()
    
    # Get resumes from Django
    django_cursor.execute("""
        SELECT 
            id, user_id, filename, file_path, file_size,
            mime_type, extracted_text, analysis_results,
            created_at, updated_at
        FROM resumes_resume
    """)
    
    resumes = django_cursor.fetchall()
    migrated_count = 0
    
    for resume in resumes:
        try:
            # Insert into Express database
            express_cursor.execute("""
                INSERT INTO resumes (
                    id, user_id, filename, file_path, file_size,
                    mime_type, extracted_text, analysis_results,
                    created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    filename = EXCLUDED.filename,
                    updated_at = EXCLUDED.updated_at
            """, (
                resume['id'], resume['user_id'], resume['filename'],
                resume['file_path'], resume['file_size'], resume['mime_type'],
                resume['extracted_text'], resume['analysis_results'],
                resume['created_at'], resume['updated_at']
            ))
            migrated_count += 1
        except Exception as e:
            print(f"⚠️  Failed to migrate resume {resume['filename']}: {e}")
    
    express_conn.commit()
    print(f"✅ Migrated {migrated_count} resumes")

def migrate_ai_content(django_conn, express_conn):
    """Migrate AI generated content from Django to Express"""
    print("🤖 Migrating AI content...")
    
    django_cursor = django_conn.cursor()
    express_cursor = express_conn.cursor()
    
    # Get AI content from Django
    django_cursor.execute("""
        SELECT 
            id, user_id, content_type, job_id, content,
            metadata, created_at
        FROM ai_services_aigeneratedcontent
    """)
    
    ai_content = django_cursor.fetchall()
    migrated_count = 0
    
    for content in ai_content:
        try:
            # Insert into Express database
            express_cursor.execute("""
                INSERT INTO ai_generated_content (
                    id, user_id, type, job_id, content,
                    metadata, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    content = EXCLUDED.content,
                    metadata = EXCLUDED.metadata
            """, (
                content['id'], content['user_id'], content['content_type'],
                content['job_id'], content['content'], content['metadata'],
                content['created_at']
            ))
            migrated_count += 1
        except Exception as e:
            print(f"⚠️  Failed to migrate AI content {content['id']}: {e}")
    
    express_conn.commit()
    print(f"✅ Migrated {migrated_count} AI content items")

def create_migration_report(django_conn, express_conn):
    """Create a migration report"""
    print("📊 Creating migration report...")
    
    django_cursor = django_conn.cursor()
    express_cursor = express_conn.cursor()
    
    report = {
        'migration_date': datetime.now().isoformat(),
        'tables': {}
    }
    
    # Count records in each table
    tables = ['users', 'jobs', 'job_applications', 'resumes', 'ai_generated_content']
    
    for table in tables:
        # Django counts
        if table == 'users':
            django_cursor.execute("SELECT COUNT(*) FROM authentication_user")
        elif table == 'jobs':
            django_cursor.execute("SELECT COUNT(*) FROM jobs_job")
        elif table == 'job_applications':
            django_cursor.execute("SELECT COUNT(*) FROM jobs_jobapplication")
        elif table == 'resumes':
            django_cursor.execute("SELECT COUNT(*) FROM resumes_resume")
        elif table == 'ai_generated_content':
            django_cursor.execute("SELECT COUNT(*) FROM ai_services_aigeneratedcontent")
        
        django_count = django_cursor.fetchone()[0]
        
        # Express counts
        express_cursor.execute(f"SELECT COUNT(*) FROM {table}")
        express_count = express_cursor.fetchone()[0]
        
        report['tables'][table] = {
            'django_count': django_count,
            'express_count': express_count,
            'migration_success': django_count == express_count
        }
    
    # Save report
    with open('migration_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("📋 Migration Report:")
    print("-" * 50)
    for table, data in report['tables'].items():
        status = "✅" if data['migration_success'] else "❌"
        print(f"{status} {table}: {data['django_count']} → {data['express_count']}")
    
    print(f"\n📄 Detailed report saved to: migration_report.json")

def main():
    print("🔄 Starting data migration from Django to Express.js...")
    
    # Connect to databases
    django_conn = connect_django_db()
    if not django_conn:
        return
    
    express_conn = connect_express_db()
    if not express_conn:
        return
    
    try:
        # Run migrations
        migrate_users(django_conn, express_conn)
        migrate_jobs(django_conn, express_conn)
        migrate_job_applications(django_conn, express_conn)
        migrate_resumes(django_conn, express_conn)
        migrate_ai_content(django_conn, express_conn)
        
        # Create report
        create_migration_report(django_conn, express_conn)
        
        print("\n🎉 Migration completed successfully!")
        print("\n📋 Next steps:")
        print("1. Review the migration report")
        print("2. Test the Express.js API endpoints")
        print("3. Update frontend to use new API")
        print("4. Backup the Django database")
        print("5. Deploy the new Express.js backend")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        express_conn.rollback()
    
    finally:
        django_conn.close()
        express_conn.close()

if __name__ == "__main__":
    main()
