import { ChatInterface } from "@/components/legal/chat-interface";
import { PageHeader } from "@/components/shared/page-header";

export default function LegalAssistantPage() {
    return (
        <>
            <PageHeader
                title="Asistente Legal IA"
                description="Hazle preguntas a nuestro asistente de IA sobre tu situación de deuda."
            />
            <ChatInterface />
        </>
    );
}
