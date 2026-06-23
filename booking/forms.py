from django import forms

from .validators import is_personal_email

COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Germany']

SERVICES = [
    '483 Observations',
    'cGMP Six Systems',
    'Investigators',
    'Warning Letter',
    'ANDA Submission Support (CTD + Checklist)',
    'Facility Templates (ANDA/API)',
    'White Paper (Strategic Paper)',
    'Controlled Correspondence',
    'DMF Checklist',
    'Validation & Compliance Checklist',
    'General Product Demo',
    'Custom / Not Sure Yet',
]


class BookingForm(forms.Form):
    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=True)
    full_name = forms.CharField(required=False)
    email = forms.EmailField(required=True)
    phone = forms.CharField(required=False)
    country = forms.CharField(required=False)
    company = forms.CharField(required=False)
    company_domain = forms.CharField(required=False)
    service = forms.CharField(required=False)
    question = forms.CharField(required=False)
    date = forms.RegexField(regex=r'^\d{4}-\d{2}-\d{2}$', required=True)
    time = forms.RegexField(regex=r'^\d{2}:\d{2}$', required=True)

    def clean_email(self):
        email = self.cleaned_data['email']
        if is_personal_email(email):
            raise forms.ValidationError('Please use your work email, not a personal email.')
        return email
