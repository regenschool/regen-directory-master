import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ExportStudentsCSV = () => {
  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('v_student_enrollments_enriched')
        .select('*')
        .order('last_name');

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info('Aucune donnée à exporter');
        return;
      }

      // Préparer les en-têtes
      const headers = [
        'id',
        'first_name',
        'last_name',
        'birth_date',
        'age',
        'class_name',
        'level_name',
        'school_year_label',
        'assigned_teacher_name',
        'assigned_teacher_email',
        'academic_background',
        'company',
        'photo_url',
        'special_needs',
        'created_at'
      ];

      // Créer le contenu CSV
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Échapper les virgules et guillemets
            const stringValue = value?.toString() || '';
            return stringValue.includes(',') || stringValue.includes('"')
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          }).join(',')
        )
      ].join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${data.length} étudiants exportés`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export : ' + error.message);
    }
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Exporter en CSV
    </Button>
  );
};
